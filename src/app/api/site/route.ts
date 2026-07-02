import { NextResponse } from "next/server";
import {
  buildWhatsAppUrl,
  getFallbackGallery,
  getInstagramMedia,
  getSiteContent,
} from "@/lib/api-data";
import { company } from "@/lib/site-data";

export async function GET() {
  const [content, instagramMedia] = await Promise.all([
    getSiteContent(),
    getInstagramMedia(),
  ]);

  return NextResponse.json({
    company,
    content,
    whatsappUrl: buildWhatsAppUrl(content),
    delivery: content.delivery,
    seo: content.seo,
    gallery: instagramMedia.length ? instagramMedia : getFallbackGallery(),
    integrations: {
      supabase: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
      instagram: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN),
      cep: true,
      payments: false,
      whatsappCloud: false,
    },
  });
}
