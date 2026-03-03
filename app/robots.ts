import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/changelog"],
        disallow: ["/login", "/auth/", "/c/"],
      },
    ],
    sitemap: "https://momentto.carrijoga.com.br/sitemap.xml",
  }
}
