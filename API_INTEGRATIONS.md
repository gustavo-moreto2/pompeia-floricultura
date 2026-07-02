# APIs integradas

## Supabase

Usado como gerenciador de conteúdo e captura de pedidos.

- Tabela `settings`: alimenta textos, telefone, WhatsApp, endereço, horários e serviços.
- Tabela `leads`: recebe pedidos do formulário e da API em JSON.
- Painel `/admin`: usa Supabase Auth.

Variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## API interna do site

- `GET /api/site`: retorna empresa, conteúdo editável, URL de WhatsApp, galeria e status das integrações.
- `GET /api/instagram`: retorna mídia do Instagram quando `INSTAGRAM_ACCESS_TOKEN` existir; caso contrário retorna uma alternativa local.
- `POST /api/leads`: recebe `{ "name", "contact", "message", "source" }` e salva em `leads`.
- `GET /api/whatsapp`: redireciona para `wa.me` com mensagem pronta quando o WhatsApp estiver configurado no Supabase.

## Instagram

Opcional. Configure um token compatível com Instagram Graph/Basic Display em:

```env
INSTAGRAM_ACCESS_TOKEN=
```

Sem token, a galeria usa os arquivos locais de exemplo para manter o visual.
