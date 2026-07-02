create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  address text,
  phone text,
  whatsapp text,
  instagram text,
  google_maps_url text,
  rating numeric(2, 1),
  review_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  type text not null check (type in ('phone', 'whatsapp', 'email', 'instagram', 'maps')),
  label text,
  value text not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  message text not null,
  source text not null default 'site',
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_touch_updated_at on public.companies;
create trigger companies_touch_updated_at
before update on public.companies
for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch_updated_at on public.settings;
create trigger settings_touch_updated_at
before update on public.settings
for each row execute function public.touch_updated_at();

alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.settings enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.companies, public.contacts, public.settings to anon, authenticated;
grant insert on public.leads to anon, authenticated;
grant select, update on public.leads to authenticated;
grant insert, update, delete on public.companies, public.contacts, public.settings to authenticated;

drop policy if exists "Owner can upload product images" on storage.objects;
create policy "Owner can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')
);

drop policy if exists "Owner can update product images" on storage.objects;
create policy "Owner can update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')
)
with check (
  bucket_id = 'product-images'
  and (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')
);

drop policy if exists "Owner can delete product images" on storage.objects;
create policy "Owner can delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')
);

create index if not exists contacts_company_id_idx on public.contacts(company_id);
create index if not exists settings_updated_by_idx on public.settings(updated_by);

drop policy if exists "Public can read company profile" on public.companies;
create policy "Public can read company profile"
on public.companies for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated owner can manage company profile" on public.companies;
drop policy if exists "Authenticated owner can update company profile" on public.companies;
drop policy if exists "Authenticated owner can delete company profile" on public.companies;
create policy "Authenticated owner can manage company profile"
on public.companies for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

create policy "Authenticated owner can update company profile"
on public.companies for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

create policy "Authenticated owner can delete company profile"
on public.companies for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

drop policy if exists "Public can read public contacts" on public.contacts;
create policy "Public can read public contacts"
on public.contacts for select
to anon, authenticated
using (is_public = true);

drop policy if exists "Authenticated owner can manage contacts" on public.contacts;
drop policy if exists "Authenticated owner can update contacts" on public.contacts;
drop policy if exists "Authenticated owner can delete contacts" on public.contacts;
create policy "Authenticated owner can manage contacts"
on public.contacts for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

create policy "Authenticated owner can update contacts"
on public.contacts for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

create policy "Authenticated owner can delete contacts"
on public.contacts for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

drop policy if exists "Anyone can submit leads" on public.leads;
create policy "Anyone can submit leads"
on public.leads for insert
to anon, authenticated
with check (
  length(name) between 2 and 160
  and length(contact) between 5 and 200
  and length(message) between 8 and 3000
);

drop policy if exists "Authenticated owner can read leads" on public.leads;
create policy "Authenticated owner can read leads"
on public.leads for select
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

drop policy if exists "Authenticated owner can update leads" on public.leads;
create policy "Authenticated owner can update leads"
on public.leads for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

drop policy if exists "Public can read settings" on public.settings;
create policy "Public can read settings"
on public.settings for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated owner can manage settings" on public.settings;
drop policy if exists "Authenticated owner can update settings" on public.settings;
drop policy if exists "Authenticated owner can delete settings" on public.settings;
create policy "Authenticated owner can manage settings"
on public.settings for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

create policy "Authenticated owner can update settings"
on public.settings for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

create policy "Authenticated owner can delete settings"
on public.settings for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'owner');

insert into public.companies (
  name,
  category,
  description,
  address,
  phone,
  whatsapp,
  instagram,
  google_maps_url
) select
  'Floricultura Pompeia',
  'Floricultura, flores, plantas e paisagismo',
  'Floricultura em Piracicaba com presenca publica no Instagram e foco em flores, plantas, presentes e atendimento local.',
  'PLACEHOLDER - confirmar endereco exato no Google Maps',
  '+55 13 95539-7013',
  '+55 13 95539-7013',
  'https://www.instagram.com/pompeia_floricultura/?hl=pt',
  'https://share.google/a6bSwTseBNR4l0OV5'
where not exists (
  select 1 from public.companies where name = 'Floricultura Pompeia'
);

insert into public.settings (key, value)
values (
  'site_content',
  '{
    "headline": "Flores frescas, buques e presentes em Piracicaba",
    "subheadline": "Atendimento local para buques, arranjos, vasos, cestas e presentes com entrega em Piracicaba.",
    "address": "PLACEHOLDER - confirmar endereco exato no Google Maps",
    "phone": "+55 13 95539-7013",
    "whatsapp": "+55 13 95539-7013",
    "whatsappMessage": "Ola, vim pelo site da Floricultura Pompeia e gostaria de fazer um orçamento.",
    "hours": "PLACEHOLDER - confirmar horarios de funcionamento",
    "services": "Buques, arranjos florais, vasos, cestas, entrega local e presentes sob encomenda.",
    "mapQuery": "Floricultura Pompeia Piracicaba SP",
    "delivery": {
      "originCity": "Piracicaba",
      "originState": "SP",
      "localFee": 12,
      "localDeadline": "Entrega local no mesmo dia, conforme horario do pedido",
      "regionalCities": [
        {"city":"Rio das Pedras","fee":24,"deadline":"Entrega em ate 1 dia util"},
        {"city":"Saltinho","fee":24,"deadline":"Entrega em ate 1 dia util"},
        {"city":"Charqueada","fee":32,"deadline":"Entrega em ate 1 dia util"},
        {"city":"Limeira","fee":38,"deadline":"Entrega em ate 1 dia util"},
        {"city":"Santa Barbara d Oeste","fee":38,"deadline":"Entrega em ate 1 dia util"},
        {"city":"Americana","fee":45,"deadline":"Entrega em ate 1 dia util"},
        {"city":"Sao Pedro","fee":45,"deadline":"Entrega em ate 1 dia util"}
      ],
      "unavailableMessage": "Cidade fora da area automatica. Consulte a taxa pelo WhatsApp."
    },
    "seo": {
      "title": "Floricultura Pompeia | Flores e presentes em Piracicaba",
      "description": "Floricultura Pompeia em Piracicaba. Buques, arranjos, vasos, cestas, presentes e atendimento local.",
      "keywords": "floricultura em Piracicaba, flores em Piracicaba, buque Piracicaba, arranjos florais Piracicaba"
    },
    "products": [
      {"title":"Buques","oldPrice":"R$ 129","price":"R$ 89","image":"/images/mockup/product-buques.png","images":["/images/mockup/product-buques.png"],"promo":true,"event":"Dia dos Namorados","description":"Buques para presentes, datas especiais e pedidos personalizados.","active":true},
      {"title":"Arranjos","price":"A partir de R$ 120","image":"/images/mockup/product-arranjos.png","images":["/images/mockup/product-arranjos.png"],"description":"Composicoes para casa, empresas, celebracoes e homenagens.","active":true},
      {"title":"Vasos","price":"A partir de R$ 59","image":"/images/mockup/product-vasos.png","images":["/images/mockup/product-vasos.png"],"description":"Plantas e vasos decorativos para ambientes internos e externos.","active":true},
      {"title":"Cestas","oldPrice":"R$ 180","price":"R$ 149","image":"/images/mockup/product-cestas.png","images":["/images/mockup/product-cestas.png"],"promo":true,"event":"Datas especiais","description":"Cestas e presentes sob encomenda para ocasioes especiais.","active":true},
      {"title":"Orquideas","price":"A partir de R$ 95","image":"/images/mockup/gallery-orquideas.png","images":["/images/mockup/gallery-orquideas.png"],"description":"Orquideas embaladas para presente ou decoracao.","active":true},
      {"title":"Lirios","price":"A partir de R$ 110","image":"/images/mockup/gallery-lirios.png","images":["/images/mockup/gallery-lirios.png"],"description":"Lirios elegantes para datas especiais e homenagens.","active":true}
    ],
    "gallery": [
      {"caption":"Orquideas","mediaUrl":"/images/mockup/gallery-orquideas.png","permalink":"https://www.instagram.com/pompeia_floricultura/?hl=pt"},
      {"caption":"Lirios","mediaUrl":"/images/mockup/gallery-lirios.png","permalink":"https://www.instagram.com/pompeia_floricultura/?hl=pt"},
      {"caption":"Buque de rosas","mediaUrl":"/images/mockup/gallery-rosas.png","permalink":"https://www.instagram.com/pompeia_floricultura/?hl=pt"},
      {"caption":"Arranjo floral","mediaUrl":"/images/mockup/gallery-arranjo.png","permalink":"https://www.instagram.com/pompeia_floricultura/?hl=pt"},
      {"caption":"Vaso com lirios","mediaUrl":"/images/mockup/gallery-vaso-lirios.png","permalink":"https://www.instagram.com/pompeia_floricultura/?hl=pt"}
    ],
    "reviews": [
      {"name":"Cliente local","text":"Atendimento cuidadoso e flores muito bonitas."},
      {"name":"Pedido por WhatsApp","text":"Pedido acompanhado com cuidado do comeco ao fim."},
      {"name":"Presente especial","text":"Arranjo feito com capricho para presentear."}
    ],
    "faq": [
      {"question":"Voces fazem entrega em Piracicaba?","answer":"Sim. A area, o prazo e a taxa de entrega sao confirmados pelo WhatsApp."},
      {"question":"Quais formas de pagamento sao aceitas?","answer":"As formas de pagamento devem ser confirmadas no atendimento."},
      {"question":"E possivel agendar entregas?","answer":"Sim. Informe data, horario desejado e endereco para orcamento."},
      {"question":"Voces personalizam buques e arranjos?","answer":"Sim. O pedido pode ser ajustado conforme ocasiao, cores e flores disponiveis."}
    ]
  }'::jsonb
) on conflict (key) do update set
  value = public.settings.value || excluded.value,
  updated_at = now();
