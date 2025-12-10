import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Eve AI - Intelligent Insurance Agency Automation",
    template: "%s | Eve AI",
  },
  description: "Transform your insurance agency with AI-powered automation. Bilingual support for English and Chinese, streamlined workflows, and intelligent client management.",
  keywords: [
    "insurance agency software",
    "insurance automation",
    "AI insurance platform",
    "bilingual insurance software",
    "insurance CRM",
    "agency management system",
    "Chinese insurance software",
    "insurance workflow automation",
  ],
  authors: [{ name: "Eve AI" }],
  creator: "Eve AI",
  publisher: "Eve AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://eve-ai.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "zh_CN",
    siteName: "Eve AI",
    title: "Eve AI - Intelligent Insurance Agency Automation",
    description: "Transform your insurance agency with AI-powered automation. Bilingual support, streamlined workflows, and intelligent client management.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eve AI - Intelligent Insurance Agency Automation",
    description: "Transform your insurance agency with AI-powered automation.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--card)',
                color: 'var(--card-foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
