import React from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { FloatingContact } from "@/components/FloatingContact";
import "./globals.css";

const _dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-inter" });
const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bloomroseaccesorios.com";
const SITE_NAME = "Bloomrose Accesorios";
const DEFAULT_DESCRIPTION =
  "Bisutería y accesorios artesanales hechos en Colombia. Aretes, collares, pulseras, anillos y más, con envíos a todo el país.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Bisutería artesanal`,
    template: "%s · Bloomrose",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: [
    "Bloomrose",
    "Bloomrose Accesorios",
    "bisutería Colombia",
    "accesorios artesanales",
    "aretes",
    "collares",
    "pulseras",
    "anillos",
    "joyería artesanal",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/image.png",
    apple: "/images/image.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} · Bisutería artesanal`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · Bisutería artesanal`,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#EF8FB0",
};

// Schema.org Organization para mejorar el conocimiento de marca en buscadores.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "Bloomrose",
  url: SITE_URL,
  logo: `${SITE_URL}/images/image.png`,
  description: DEFAULT_DESCRIPTION,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Atención al cliente",
    areaServed: "CO",
    availableLanguage: ["Spanish"],
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "CO",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "es-CO",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/productos?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const chatEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <html lang="es-CO">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <FloatingContact
          whatsappNumber={whatsappNumber}
          chatEnabled={chatEnabled}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
      </body>
    </html>
  );
}
