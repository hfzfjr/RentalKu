import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "RentalKu - Aplikasi Manajemen Rental Kendaraan",
    template: "%s | RentalKu",
  },
  description:
    "RentalKu adalah dashboard admin untuk mengelola rental kendaraan: pantau unit, data penyewa, dan status penyewaan dalam satu tempat dengan mudah dan cepat.",
  applicationName: "RentalKu",
  keywords: [
    "aplikasi rental kendaraan",
    "manajemen rental mobil",
    "dashboard rental",
    "data penyewa",
    "sistem rental kendaraan",
  ],
  icons: {
    icon: "/logo-putih.png",
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "RentalKu",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "RentalKu",
    title: "RentalKu - Aplikasi Manajemen Rental Kendaraan",
    description:
      "RentalKu adalah dashboard admin untuk mengelola rental kendaraan: pantau unit, data penyewa, dan status penyewaan dalam satu tempat dengan mudah dan cepat.",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RentalKu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RentalKu - Aplikasi Manajemen Rental Kendaraan",
    description:
      "RentalKu adalah dashboard admin untuk mengelola rental kendaraan: pantau unit, data penyewa, dan status penyewaan dalam satu tempat dengan mudah dan cepat.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        {children}
      </body>
    </html>
  );
}
