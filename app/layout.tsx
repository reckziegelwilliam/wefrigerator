import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "wefrigerator",
  description: "Find and support community fridges in your area with wefrigerator. Real-time status updates, volunteer opportunities, and community support.",
  icons: {
    icon: [
      { url: '/app-icon-1024.png', sizes: '1024x1024', type: 'image/png' },
      { url: '/app-icon-1024.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/app-icon-1024.png', sizes: '1024x1024', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'wefrigerator',
    description: 'Find and support community fridges in your area with wefrigerator. Real-time status updates, volunteer opportunities, and community support.',
    images: [
      {
        url: '/social-og-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'wefrigerator - Community Fridge Network',
      },
    ],
    type: 'website',
    siteName: 'wefrigerator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'wefrigerator',
    description: 'Find and support community fridges in your area with wefrigerator. Real-time status updates, volunteer opportunities, and community support.',
    images: ['/social-og-1200x630.png'],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
