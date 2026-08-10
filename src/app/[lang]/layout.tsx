import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { locales } from "@/lib/dictionaries";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amante - Google Sheets to WhatsApp Message",
  description:
    "Paste a range copied from Google Sheets and get a ready-to-send WhatsApp message.",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  return (
    <html
      lang={lang === "zh" ? "zh-Hans" : "en"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
