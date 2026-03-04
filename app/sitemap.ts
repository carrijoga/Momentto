import type { MetadataRoute } from "next"

const BASE_URL = "https://momentto.carrijoga.com.br"
const LOCALES = ["en", "pt-BR", "es", "fr", "de"]

export default function sitemap(): MetadataRoute.Sitemap {
  const localizedHome = LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 1,
  }))

  const localizedChangelog = LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}/changelog`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...localizedHome, ...localizedChangelog]
}
