import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Flower2,
  MessageCircle,
  Star,
} from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { ProductCatalog } from "@/components/product-catalog";
import { ShippingCalculator } from "@/components/shipping-calculator";
import { Button } from "@/components/ui/button";
import {
  buildWhatsAppUrl,
  buildGoogleMapsEmbedUrl,
  getFallbackGallery,
  getInstagramMedia,
  getSiteContent,
} from "@/lib/api-data";
import { company } from "@/lib/site-data";

const navItems = [
  ["Home", "#home"],
  ["Sobre", "#sobre"],
  ["Serviços", "#servicos"],
  ["Produtos", "#servicos"],
  ["Galeria", "#galeria"],
  ["Avaliações", "#avaliacoes"],
  ["Contato", "#contato"],
];

function Logo() {
  return (
    <Link href="#home" className="flex items-center gap-2 text-primary">
      <Flower2 className="size-8 stroke-[1.35] text-[#e58c8e]" />
      <span className="font-serif text-[23px] font-medium leading-[0.95]">
        Floricultura
        <br />
        Pompéia
      </span>
    </Link>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mb-5 flex max-w-lg flex-col items-center text-center">
      <h2 className="font-serif text-[26px] font-medium leading-tight text-primary md:text-[30px]">
        {children}
      </h2>
      <div className="mt-2.5 flex w-full items-center justify-center gap-4">
        <span className="h-px w-28 bg-border" />
        <Flower2 className="size-4 stroke-[1.25] text-[#e58c8e]" />
        <span className="h-px w-28 bg-border" />
      </div>
    </div>
  );
}

function WhatsAppButton({
  className = "",
  href = "/api/whatsapp",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Button
      render={<a href={href} />}
      nativeButton={false}
      className={`h-10 rounded-[3px] bg-primary px-4 text-[12px] font-semibold shadow-sm hover:bg-primary/90 ${className}`}
    >
      <MessageCircle data-icon="inline-start" />
      Chamar no WhatsApp
    </Button>
  );
}

export default async function Home() {
  const [content, instagramMedia] = await Promise.all([
    getSiteContent(),
    getInstagramMedia(),
  ]);
  const editableGallery = content.gallery.map((item, index) => ({
    id: `editable-${index}`,
    caption: item.caption,
    mediaUrl: item.mediaUrl,
    permalink: item.permalink,
    mediaType: "IMAGE",
  }));
  const galleryItems = (
    instagramMedia.length ? instagramMedia : editableGallery.length ? editableGallery : getFallbackGallery()
  ).slice(0, 5);
  const whatsappUrl = buildWhatsAppUrl(content);
  const mapsUrl = buildGoogleMapsEmbedUrl(content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Florist",
    name: company.name,
    description: company.description,
    image: "/images/hero-floricultura-pompeia.png",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pompeia-floricultura.vercel.app",
    address: {
      "@type": "PostalAddress",
      streetAddress: content.address,
      addressLocality: company.city,
      addressRegion: company.state,
      addressCountry: "BR",
    },
    telephone: content.phone,
    sameAs: [company.instagram, company.googleMapsShare],
  };

  return (
    <main id="home" className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="relative z-20 h-[70px] border-b bg-white/95">
        <div className="mx-auto flex h-full max-w-[820px] items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-[25px] text-[12px] text-[#222] md:flex">
            {navItems.map(([label, href]) => (
              <a key={label} href={href} className="hover:text-primary">
                {label}
              </a>
            ))}
          </nav>
          <WhatsAppButton href={whatsappUrl} className="hidden md:inline-flex" />
        </div>
      </header>

      <section className="relative h-[428px] overflow-hidden border-b bg-white md:h-[428px]">
        <div className="hero-image absolute inset-y-0 right-0 w-full md:w-[67%]">
          <Image
            src="/images/hero-floricultura-pompeia.png"
            alt="Flores e plantas em uma floricultura"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="hero-fade absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-[820px] items-center px-5">
          <div className="mt-2 max-w-[360px]">
            <h1 className="font-serif text-[64px] font-medium leading-[0.92] text-primary md:text-[68px]">
              Floricultura
              <br />
              Pompéia
            </h1>
            <p className="mt-7 max-w-[285px] text-[20px] leading-[1.25] text-[#4f5551]">
              {content.headline}
            </p>
            <p className="mt-3 max-w-[310px] text-[13px] leading-relaxed text-[#5f6762]">
              {content.subheadline}
            </p>
            <div className="mt-6 flex gap-4">
              <WhatsAppButton href={whatsappUrl} />
              <Button
                render={<a href="#servicos" />}
                nativeButton={false}
                variant="outline"
                className="h-10 rounded-[3px] border-primary/80 px-7 text-[12px] text-primary hover:bg-primary/5"
              >
                Ver serviços
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="border-b bg-[#fbfcfa] py-5">
        <div className="mx-auto grid max-w-[820px] gap-4 px-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e58c8e]">
              Floricultura local
            </p>
            <h2 className="mt-2 font-serif text-[28px] leading-tight text-primary">
              Flores, presentes e atendimento em Piracicaba
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#4f5551]">
              {content.services}
            </p>
          </div>
          <div className="rounded-[6px] border bg-white p-4 text-[12px] leading-relaxed text-[#4f5551] shadow-[0_1px_8px_rgba(0,0,0,0.035)]">
            <p className="font-medium text-[#2d302e]">Atendimento</p>
            <p className="mt-2 whitespace-pre-line">{content.hours}</p>
          </div>
        </div>
      </section>

      <section id="servicos" className="border-b bg-white pb-3 pt-7">
        <div className="mx-auto max-w-[820px] px-5">
          <SectionTitle>Nossos serviços e produtos</SectionTitle>
          <ProductCatalog content={content} />
        </div>
      </section>

      <section id="galeria" className="bg-white pb-4 pt-6">
        <div className="mx-auto max-w-[820px] px-5">
          <SectionTitle>Galeria</SectionTitle>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {galleryItems.map((item, index) => (
              <a
                key={item.id}
                href={item.mediaUrl}
                target="_blank"
                className="group relative aspect-[150/176] overflow-hidden rounded-[4px]"
                aria-label={`Abrir foto: ${item.caption}`}
              >
                <Image
                  src={item.mediaUrl}
                  alt={`Galeria Floricultura Pompéia ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={item.mediaUrl.startsWith("http")}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-8 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {item.caption}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="avaliacoes" className="border-b bg-white py-5">
        <div className="mx-auto grid max-w-[820px] gap-9 px-5 md:grid-cols-[1fr_1fr]">
          <div>
            <SectionTitle>Avaliações</SectionTitle>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
              {content.reviews.map((review, index) => (
                <div
                  key={`${review.name}-${index}`}
                  className="min-h-[100px] rounded-[6px] border bg-white p-3 shadow-[0_1px_8px_rgba(0,0,0,0.035)]"
                >
                  <div className="mb-4 flex gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star key={star} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-[11px] leading-snug text-[#4f5551]">{review.text}</p>
                  <p className="mt-2 text-[11px] font-medium text-[#363a37]">
                    {review.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="md:border-l md:pl-8">
            <SectionTitle>Perguntas frequentes</SectionTitle>
            <div className="divide-y">
              {content.faq.map((item) => (
                <details key={item.question} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-left text-[13px] text-[#2d302e]">
                    {item.question}
                    <ChevronDown className="size-4 text-[#151817] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contato" className="border-b bg-white py-5">
        <div className="mx-auto grid max-w-[820px] gap-10 px-5 md:grid-cols-[250px_1fr]">
          <div>
            <SectionTitle>Fale conosco</SectionTitle>
            <p className="mb-5 text-[12px] leading-relaxed text-[#4f5551]">
              Entre em contato para pedidos, orçamentos ou dúvidas. Teremos prazer
              em atender você.
            </p>
            <div className="mb-4">
              <ShippingCalculator whatsappUrl={whatsappUrl} />
            </div>
            <LeadForm products={content.products} />
          </div>
          <div>
            <SectionTitle>Onde estamos</SectionTitle>
            <div className="overflow-hidden rounded-[7px] border bg-white shadow-[0_1px_8px_rgba(0,0,0,0.035)]">
              <div className="h-[220px] bg-muted md:h-[260px]">
                <iframe
                  title="Localização da Floricultura Pompéia no Google Maps"
                  src={mapsUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                />
              </div>
              <div className="px-4 py-3">
                <p className="text-[13px] font-medium text-[#2d302e]">{content.address}</p>
                <p className="mt-1 text-[11px] text-[#4f5551]">
                  {content.hours.split("\n")[0] ?? "Atendimento local com carinho e agilidade."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Button
        render={<a href={whatsappUrl} />}
        nativeButton={false}
        className="fixed bottom-5 right-5 z-40 h-11 rounded-full bg-primary px-5 text-[12px] shadow-xl"
      >
        <MessageCircle data-icon="inline-start" />
        WhatsApp
      </Button>
    </main>
  );
}
