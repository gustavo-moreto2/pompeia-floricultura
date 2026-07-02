import type { MetadataRoute } from "next";

const routes = ["", "/sobre", "/servicos", "/produtos", "/galeria", "/avaliacoes", "/contato"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://pompeia-floricultura.vercel.app";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route ? 0.8 : 1,
  }));
}
