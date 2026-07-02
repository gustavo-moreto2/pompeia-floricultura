import { z } from "zod";
import { company, gallery } from "@/lib/site-data";
import {
  defaultDeliverySettings,
  mergeDeliverySettings,
  type DeliverySettings,
} from "@/lib/delivery";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type InstagramMedia = {
  id: string;
  caption: string;
  mediaUrl: string;
  permalink: string;
  mediaType: string;
};

export type SiteContent = {
  headline: string;
  subheadline: string;
  whatsapp: string;
  phone: string;
  address: string;
  hours: string;
  services: string;
  mapQuery: string;
  whatsappMessage: string;
  products: ProductItem[];
  reviews: ReviewItem[];
  faq: FaqItem[];
  gallery: EditableGalleryItem[];
  delivery: DeliverySettings;
  seo: SeoSettings;
};

export type ProductItem = {
  title: string;
  description: string;
  price?: string;
  oldPrice?: string;
  image?: string;
  images?: string[];
  icon?: string;
  promo?: boolean;
  event?: string;
  active?: boolean;
};

export type ReviewItem = {
  name: string;
  text: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type EditableGalleryItem = {
  caption: string;
  mediaUrl: string;
  permalink: string;
};

export type SeoSettings = {
  title: string;
  description: string;
  keywords: string;
};

const settingsValueSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  hours: z.string().optional(),
  services: z.string().optional(),
  mapQuery: z.string().optional(),
  whatsappMessage: z.string().optional(),
  products: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        price: z.string().optional(),
        oldPrice: z.string().optional(),
        image: z.string().optional(),
        images: z.array(z.string()).optional(),
        icon: z.string().optional(),
        promo: z.boolean().optional(),
        event: z.string().optional(),
        active: z.boolean().optional(),
      }),
    )
    .optional(),
  reviews: z
    .array(z.object({ name: z.string(), text: z.string() }))
    .optional(),
  faq: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
  gallery: z
    .array(
      z.object({
        caption: z.string(),
        mediaUrl: z.string(),
        permalink: z.string().optional(),
      }),
    )
    .optional(),
  delivery: z
    .object({
      originCity: z.string().optional(),
      originState: z.string().optional(),
      localFee: z.number().optional(),
      localDeadline: z.string().optional(),
      regionalCities: z
        .array(
          z.object({
            city: z.string(),
            fee: z.number(),
            deadline: z.string(),
          }),
        )
        .optional(),
      unavailableMessage: z.string().optional(),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.string().optional(),
    })
    .optional(),
});

export const fallbackSiteContent: SiteContent = {
  headline: "Flores frescas, buquês e presentes em Piracicaba",
  subheadline: "Atendimento local para buquês, arranjos, vasos, cestas e presentes com entrega em Piracicaba.",
  whatsapp: "+55 13 95539-7013",
  phone: "+55 13 95539-7013",
  address: "Piracicaba, SP",
  hours: "Segunda a sábado: confirmar horário no WhatsApp\nDomingos e feriados: atendimento sob consulta",
  services: "Buquês, arranjos florais, vasos, cestas, entrega local e presentes sob encomenda.",
  mapQuery: "Floricultura Pompeia Piracicaba SP",
  whatsappMessage:
    "Olá, vim pelo site da Floricultura Pompéia e gostaria de fazer um orçamento.",
  products: [
    {
      title: "Buquês",
      description: "Buquês para presentes, datas especiais e pedidos personalizados.",
      oldPrice: "R$ 129",
      price: "R$ 89",
      image: "/images/mockup/product-buques.png",
      promo: true,
      event: "Dia dos Namorados",
    },
    {
      title: "Arranjos",
      description: "Composições para casa, empresas, celebrações e homenagens.",
      price: "A partir de R$ 120",
      image: "/images/mockup/product-arranjos.png",
    },
    {
      title: "Vasos",
      description: "Plantas e vasos decorativos para ambientes internos e externos.",
      price: "A partir de R$ 59",
      image: "/images/mockup/product-vasos.png",
    },
    {
      title: "Cestas",
      description: "Cestas e presentes sob encomenda para ocasiões especiais.",
      oldPrice: "R$ 180",
      price: "R$ 149",
      image: "/images/mockup/product-cestas.png",
      promo: true,
      event: "Datas especiais",
    },
    {
      title: "Orquídeas",
      description: "Orquídeas embaladas para presente ou decoração.",
      price: "A partir de R$ 95",
      image: "/images/mockup/gallery-orquideas.png",
    },
    {
      title: "Lírios",
      description: "Lírios elegantes para datas especiais e homenagens.",
      price: "A partir de R$ 110",
      image: "/images/mockup/gallery-lirios.png",
    },
  ],
  reviews: [
    {
      name: "Cliente local",
      text: "Atendimento cuidadoso e flores muito bonitas.",
    },
    {
      name: "Pedido por WhatsApp",
      text: "Pedido acompanhado com cuidado do começo ao fim.",
    },
    {
      name: "Presente especial",
      text: "Arranjo feito com capricho para presentear.",
    },
  ],
  faq: [
    {
      question: "Vocês fazem entrega em Piracicaba?",
      answer: "Sim. A área, o prazo e a taxa de entrega são confirmados pelo WhatsApp.",
    },
    {
      question: "Quais formas de pagamento são aceitas?",
      answer: "As formas de pagamento devem ser confirmadas no atendimento.",
    },
    {
      question: "É possível agendar entregas?",
      answer: "Sim. Informe data, horário desejado e endereço para orçamento.",
    },
    {
      question: "Vocês personalizam buquês e arranjos?",
      answer: "Sim. O pedido pode ser ajustado conforme ocasião, cores e flores disponíveis.",
    },
  ],
  gallery: [],
  delivery: defaultDeliverySettings,
  seo: {
    title: `${company.name} | Flores e presentes em ${company.city}`,
    description:
      "Floricultura Pompeia em Piracicaba. Buques, arranjos, vasos, cestas, presentes e atendimento local.",
    keywords:
      "floricultura em Piracicaba, flores em Piracicaba, buque Piracicaba, arranjos florais Piracicaba",
  },
};

export function buildWhatsAppUrl(content: SiteContent, message?: string) {
  const digits = content.whatsapp.replace(/\D/g, "");
  const text = encodeURIComponent(message || content.whatsappMessage);

  if (digits.length < 10) {
    return "/#contato";
  }

  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${normalized}?text=${text}`;
}

export function buildGoogleMapsEmbedUrl(content: SiteContent) {
  const query = encodeURIComponent(content.mapQuery || content.address || "Piracicaba SP");
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (key) {
    return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${query}`;
  }

  return `https://www.google.com/maps?q=${query}&output=embed`;
}

export async function getSiteContent(): Promise<SiteContent> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return fallbackSiteContent;
  }

  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "site_content")
    .maybeSingle();

  const parsed = settingsValueSchema.safeParse(data?.value);

  if (!parsed.success) {
    return fallbackSiteContent;
  }

  return {
    ...fallbackSiteContent,
    ...Object.fromEntries(
      Object.entries(parsed.data).filter(([, value]) => Boolean(value)),
    ),
    products: parsed.data.products?.length
      ? parsed.data.products.map((item) => ({
          title: item.title,
          description: item.description ?? "",
          price: item.price,
          oldPrice: item.oldPrice,
          image: item.image ?? item.images?.[0],
          images: item.images?.length
            ? item.images
            : item.image
              ? [item.image]
              : [],
          icon: item.icon,
          promo: Boolean(item.promo),
          event: item.event,
          active: item.active ?? true,
        }))
      : fallbackSiteContent.products,
    reviews: parsed.data.reviews?.length
      ? parsed.data.reviews
      : fallbackSiteContent.reviews,
    faq: parsed.data.faq?.length ? parsed.data.faq : fallbackSiteContent.faq,
    gallery: parsed.data.gallery?.length
      ? parsed.data.gallery.map((item) => ({
          caption: item.caption,
          mediaUrl: item.mediaUrl,
          permalink: item.permalink ?? company.instagram,
        }))
      : fallbackSiteContent.gallery,
    delivery: mergeDeliverySettings(parsed.data.delivery),
    seo: {
      ...fallbackSiteContent.seo,
      ...(parsed.data.seo ?? {}),
    },
  };
}

export async function getInstagramMedia(): Promise<InstagramMedia[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return [];
  }

  const fields = "id,caption,media_url,permalink,media_type,thumbnail_url";
  const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=6&access_token=${token}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      data?: Array<{
        id?: string;
        caption?: string;
        media_url?: string;
        thumbnail_url?: string;
        permalink?: string;
        media_type?: string;
      }>;
    };

    return (payload.data ?? [])
      .map((item) => ({
        id: item.id ?? item.media_url ?? "",
        caption: item.caption ?? company.name,
        mediaUrl: item.media_type === "VIDEO" ? item.thumbnail_url ?? "" : item.media_url ?? "",
        permalink: item.permalink ?? company.instagram,
        mediaType: item.media_type ?? "IMAGE",
      }))
      .filter((item) => item.id && item.mediaUrl);
  } catch {
    return [];
  }
}

export function getFallbackGallery() {
  const editable = fallbackSiteContent.gallery.length
    ? fallbackSiteContent.gallery.map((item, index) => ({
        id: `editable-${index}`,
        caption: item.caption,
        mediaUrl: item.mediaUrl,
        permalink: item.permalink,
        mediaType: "IMAGE",
      }))
    : [];

  if (editable.length) {
    return editable;
  }

  return gallery.map((label, index) => ({
    id: `fallback-${index}`,
    caption: label,
    mediaUrl: [
      "/images/mockup/gallery-orquideas.png",
      "/images/mockup/gallery-lirios.png",
      "/images/mockup/gallery-rosas.png",
      "/images/mockup/gallery-arranjo.png",
      "/images/mockup/gallery-vaso-lirios.png",
    ][index % 5],
    permalink: company.instagram,
    mediaType: "IMAGE",
  }));
}
