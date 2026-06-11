import type { Metadata, Viewport } from "next";
import { Karla, Manrope } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Termiz — Фастфуд с доставкой",
  description: "Донеры, пита, бургеры и хот-доги с быстрой доставкой",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Termiz",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6B00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${karla.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SessionProvider>
          <PwaRegister />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
