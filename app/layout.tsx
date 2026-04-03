import React from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const _dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-inter" });
const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Bloom Rose Accesorios",
  description:
    "Accesorios femeninos elegantes y artesanales. Aretes, collares, pulseras y mas.",
  icons: {
    icon: "/images/image.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#EF8FB0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
