import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status Penyewaan",
  description:
    "Pantau status penyewaan kendaraan, tanggal mulai dan selesai, dalam satu dashboard RentalKu.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RentalsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
