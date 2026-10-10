import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RentalKu",
    short_name: "RentalKu",
    description:
      "RentalKu adalah dashboard admin untuk mengelola rental kendaraan: pantau unit, data penyewa, dan status penyewaan dalam satu tempat dengan mudah dan cepat.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "id",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
