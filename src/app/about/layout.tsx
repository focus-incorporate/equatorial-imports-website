import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us - Premium Food & Beverage Imports | Equatorial Imports",
  description: "Learn about Equatorial Imports, your trusted partner for premium food and beverage imports in Seychelles. Quality guaranteed, sourced from around the world.",
  keywords: ["about Equatorial Imports", "food imports Seychelles", "beverage imports", "premium quality", "global sourcing"],
  openGraph: {
    title: "About Equatorial Imports - Premium Food & Beverage Imports",
    description: "Your trusted partner for premium food and beverage imports in Seychelles. Quality guaranteed, sourced from around the world.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}