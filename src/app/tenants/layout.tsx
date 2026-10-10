import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Penyewa",
  description:
    "Kelola data penyewa kendaraan dengan rapi dan terstruktur di RentalKu.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TenantsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
