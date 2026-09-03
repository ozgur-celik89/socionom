import type { MetadataRoute } from "next";
import { brandColors } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "socionom.se – lediga jobb för socionomer",
    short_name: "socionom.se",
    description: "Hitta aktuella socionomjobb i hela Sverige.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    // Samma värde som <meta name="theme-color"> i layouten, annars färgar
    // webbläsaren sitt gränssnitt olika beroende på om sajten är installerad.
    theme_color: brandColors.shell,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
