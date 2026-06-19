import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { EVENT_TITLE } from "@/config/event";

const hanken = Hanken_Grotesk({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${EVENT_TITLE} — Live Vote`,
  description: "Bình chọn rap battle real-time nội bộ GEM",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A1633",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`dark ${hanken.variable}`}>
      <body className="bg-[#0A1633] text-white antialiased">{children}</body>
    </html>
  );
}
