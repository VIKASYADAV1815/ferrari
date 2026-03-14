import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Ferrari Experience | Scuderia Ferrari Showcase",
  description: "An immersive scroll-driven experience showcasing Ferrari's legendary performance, design excellence, and racing heritage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-black text-white selection:bg-[#c41e3a] selection:text-white`}
        style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
      >
        <SmoothScroll />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
