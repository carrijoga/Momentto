import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://momentto.carrijoga.com.br",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://momentto.carrijoga.com.br/changelog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]
}
