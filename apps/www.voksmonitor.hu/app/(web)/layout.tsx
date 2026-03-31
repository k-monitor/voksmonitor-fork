import type { Metadata, Viewport } from "next";

import "../globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { EmbedContextProvider, ThemeProvider } from "../../components/client";
import { PlausibleScript } from "../../components/server";
import { allowCrawling } from "../../lib/seo";

const baseUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || "http://localhost:3000";

export async function generateMetadata({ searchParams }: { searchParams: { lang?: string } }): Promise<Metadata> {
  const lang = searchParams?.lang || "hu";
  const isEn = lang === "en";
  return {
    title: {
      default: isEn ? "Voksmonitor" : "Voksmonitor",
      template: isEn ? "%s — Voksmonitor" : "%s — Voksmonitor",
    },
    description: isEn ? "Voksmonitor 2026 - Compare your views with the parties." : "Voksmonitor 2026 - pártok álláspontjainak összehasonlítása.",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/manifest.webmanifest",
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: isEn ? "Hungarian Parliamentary Elections 2026 Voksmonitor" : "Országgyűlési választások 2026 Voksmonitor",
      description: isEn ? "Voksmonitor 2026 - Compare your views with the parties." : "Voksmonitor 2026 - pártok álláspontjainak összehasonlítása.",
      url: baseUrl,
      siteName: "Voksmonitor",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: isEn ? "Voksmonitor 2026 - Compare your views with the parties." : "Voksmonitor 2026 - pártok álláspontjainak összehasonlítása.",
        },
      ],
      locale: isEn ? "en_GB" : "hu_HU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: isEn ? "Hungarian Parliamentary Elections 2026 Voksmonitor" : "Országgyűlési választások 2026 Voksmonitor",
      description: isEn ? "Voksmonitor 2026 - Compare your views with the parties." : "Voksmonitor 2026 - pártok álláspontjainak összehasonlítása.",
      images: ["/og-image.png"],
    },
    robots: {
      index: allowCrawling(),
      follow: allowCrawling(),
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function RootLayout({ children, searchParams }: { children: React.ReactNode; searchParams?: { lang?: string } }) {
  // Prefer lang from query param, fallback to cookie, then default
  const cookieStore = await cookies();
  const lang = searchParams?.lang || cookieStore.get("NEXT_LOCALE")?.value || "hu";
  const locale = lang;
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <PlausibleScript />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for Google Tag Manager initialization
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K33BBGX');`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-gray-50">
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K33BBGX" height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" />
        </noscript>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <EmbedContextProvider isEmbed={false}>
            <ThemeProvider name="default">{children}</ThemeProvider>
          </EmbedContextProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
