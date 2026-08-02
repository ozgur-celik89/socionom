import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "socionom.se – lediga jobb för socionomer",
    short_name: "socionom.se",
    description: "Hitta aktuella socionomjobb i hela Sverige.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#185a4a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
