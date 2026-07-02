import { NextResponse } from "next/server";
import { getFallbackGallery, getInstagramMedia } from "@/lib/api-data";

export async function GET() {
  const media = await getInstagramMedia();

  return NextResponse.json({
    source: media.length ? "instagram" : "fallback",
    media: media.length ? media : getFallbackGallery(),
  });
}
