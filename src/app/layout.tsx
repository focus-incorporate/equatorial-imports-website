import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/CartContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Equatorial Imports - Premium Coffee from Around the World",
  description: "Sourcing the finest coffee and beverages from around the globe, delivering premium taste experiences to Seychelles. Featuring Daniel's Blend and Viaggio Espresso.",
  keywords: "coffee, Seychelles, import, premium coffee, Daniel's Blend, Viaggio Espresso, Nespresso compatible, coffee beans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        <CartProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
