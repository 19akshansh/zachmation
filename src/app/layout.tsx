import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Provider } from "jotai";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zachmation",
  description: "The power of n8n, now in your hands!",
  openGraph: {
    title: "Zachmation",
    description: "The power of n8n, now in your hands!",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Zachmation",
    images: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL + "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Zachmation Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: "/logo.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <TRPCReactProvider>
          <NuqsAdapter>
            <Provider>{children}</Provider>
          </NuqsAdapter>
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
