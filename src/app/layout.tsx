import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "ARIA HUB | آریا هاب — Business & Visa Services",
  description:
    "Premium business, visa, and global opportunity services. خدمات حرفه‌ای تجارت، ویزا، و فرصت‌های تحصیلی جهانی - آریا هاب. Your gateway to international success.",
  keywords: [
    "ARIA HUB",
    "آریا هاب",
    "اریا هاب",
    "business services",
    "visa services",
    "خدمات ویزا",
    "scholarships",
    "بورسیه تحصیلی",
    "opportunities",
    "immigration",
    "consulting",
    "translation",
  ],
  authors: [{ name: "ARIA HUB" }],
  icons: {
    icon: "/images/logo-mark.webp",
    apple: "/images/logo-mark.webp",
  },
  openGraph: {
    title: "ARIA HUB | آریا هاب — Business & Visa Services",
    description:
      "Premium business, visa, and global opportunity services. خدمات حرفه‌ای تجارت، ویزا، و فرصت‌های تحصیلی جهانی - آریا هاب.",
    siteName: "ARIA HUB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARIA HUB | آریا هاب — Business & Visa Services",
    description:
      "Premium business, visa, and global opportunity services. خدمات حرفه‌ای تجارت، ویزا، و فرصت‌های تحصیلی جهانی - آریا هاب.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable}`}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5960471686203476" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let d = localStorage.getItem('aria-lang');
                let dir = 'rtl';
                let lang = 'fa';
                if (d) {
                  let parsed = JSON.parse(d);
                  if (parsed.state) {
                    dir = parsed.state.dir || 'rtl';
                    lang = parsed.state.code || 'fa';
                  }
                }
                document.documentElement.dir = dir;
                document.documentElement.lang = lang;
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-background text-foreground"
      >
        {/* Google AdSense - must be outside <head> when using Next.js Script component */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5960471686203476`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
