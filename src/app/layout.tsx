import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Courier_Prime } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { UserProvider } from "@/contexts/UserContext";
import AuthWrapper from "@/components/AuthWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Rafey x Munisah",
  description: "To Infinity.",
  keywords: ["heartbeat", "timer", "love", "romantic", "anniversary", "countdown"],
  authors: [{ name: "Rafey & Munisah" }],
  creator: "Rafey",
  openGraph: {
    title: "Rafey x Munisah",
    description: "To Infinity.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rafey x Munisah",
    description: "To Infinity.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${courierPrime.variable} antialiased`}
      >
        <ConvexClientProvider>
          <UserProvider>
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </UserProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
