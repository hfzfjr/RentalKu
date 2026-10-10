import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unit Kendaraan",
  description:
    "Kelola data unit kendaraan rental: tambah, ubah, dan pantau ketersediaan unit di RentalKu.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnitsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
