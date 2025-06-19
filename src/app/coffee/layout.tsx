import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Coffee Collection - Daniel's Blend & Viaggio Espresso | Equatorial Imports",
  description: "Premium coffee capsules and beans in Seychelles. Nespresso compatible Daniel's Blend and Viaggio Espresso. Intensities 5-12. Free delivery, cash on delivery.",
  keywords: ["Daniel's Blend", "Viaggio Espresso", "Nespresso compatible", "coffee capsules Seychelles", "coffee beans", "premium coffee Seychelles"],
  openGraph: {
    title: "Coffee Collection - Premium Imports in Seychelles",
    description: "Premium coffee capsules and beans. Daniel's Blend and Viaggio Espresso. Nespresso compatible. Free delivery throughout Seychelles.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CoffeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}