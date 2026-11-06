import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { QueryProvider } from "@/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://unnati-farmer-platform.vercel.app"),
  alternates: { canonical: "/" },
  title: {
    default: "UNNATI | Clear tools for India's farmers",
    template: "%s | UNNATI",
  },
  description: "A farmer-first workspace for organizing farm records, exploring public schemes, and understanding marketplace and finance tools.",
  applicationName: "UNNATI",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "UNNATI",
    title: "UNNATI | Clear tools for India's farmers",
    description: "Organize farm records and explore farmer services in one clear workspace.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster richColors position="top-right" closeButton />
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
