import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyTrip",
    short_name: "MyTrip",
    description: "Countdown timer for your special events",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1a2e",
    theme_color: "#1a1a2e",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
