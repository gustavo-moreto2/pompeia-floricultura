import { redirect } from "next/navigation";
import { buildWhatsAppUrl, getSiteContent } from "@/lib/api-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const content = await getSiteContent();

  redirect(buildWhatsAppUrl(content, searchParams.get("message") ?? undefined));
}
