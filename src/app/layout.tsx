import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteContent } from "@/lib/api-data";
import { company, localKeywords } from "@/lib/site-data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const keywords = content.seo.keywords
    ? content.seo.keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    : localKeywords;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://pompeia-floricultura.vercel.app",
    ),
    title: {
      default: content.seo.title,
      template: `%s | ${company.name}`,
    },
    description: content.seo.description,
    keywords,
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      url: "/",
      siteName: company.name,
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: "/images/hero-floricultura-pompeia.png",
          width: 1600,
          height: 900,
          alt: "Imagem ilustrativa de floricultura com flores frescas",
        },
      ],
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
