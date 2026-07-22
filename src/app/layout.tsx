import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARIA HUB — Professional Business Services Platform",
  description:
    "Premium business, visa, and global opportunity services. Your gateway to international success — business setup, legal services, visas, scholarships, and more.",
  keywords: [
    "ARIA HUB",
    "business services",
    "visa services",
    "scholarships",
    "opportunities",
    "immigration",
    "consulting",
    "translation",
  ],
  authors: [{ name: "ARIA HUB" }],
  icons: {
    icon: "/images/logo-mark.png",
    apple: "/images/logo-mark.png",
  },
  openGraph: {
    title: "ARIA HUB — Professional Business Services Platform",
    description:
      "Premium business, visa, and global opportunity services. Your gateway to international success.",
    siteName: "ARIA HUB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARIA HUB — Professional Business Services Platform",
    description:
      "Premium business, visa, and global opportunity services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
