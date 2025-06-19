import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact Us - Order Premium Coffee & Beverages | Equatorial Imports",
  description: "Contact Equatorial Imports for premium coffee orders in Seychelles. Cash on delivery, free delivery throughout all islands. Same-day delivery in Victoria.",
  keywords: ["contact Equatorial Imports", "order coffee Seychelles", "cash on delivery", "coffee delivery", "bulk pricing"],
  openGraph: {
    title: "Contact Equatorial Imports - Order Premium Coffee & Beverages",
    description: "Contact us for premium coffee orders. Cash on delivery, free delivery throughout Seychelles. Same-day delivery available in Victoria.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}