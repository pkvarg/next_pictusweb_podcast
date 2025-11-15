import { MetadataRoute } from 'next'
import db from '@/db/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pictusweb.sk'
  const locales = ['en', 'sk', 'hu']
  
  // Static pages
  const staticPages = [
    '',
    '/podcasts',
    '/contact',
    '/fleetsync',
  ]

  // Generate static page URLs for all locales
  const staticUrls: MetadataRoute.Sitemap = []
  
  for (const locale of locales) {
    for (const page of staticPages) {
      staticUrls.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: {
            en: `${baseUrl}/en${page}`,
            sk: `${baseUrl}/sk${page}`,
            hu: `${baseUrl}/hu${page}`,
          },
        },
      })
    }
  }

  // Get all published podcasts from database
  const podcasts = await db.podcast.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    where: {
      deleted: false,
      published: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Generate podcast page URLs for all locales
  const podcastUrls: MetadataRoute.Sitemap = []

  for (const podcast of podcasts) {
    for (const locale of locales) {
      podcastUrls.push({
        url: `${baseUrl}/${locale}/podcasts/${podcast.id}`,
        lastModified: podcast.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: {
            en: `${baseUrl}/en/podcasts/${podcast.id}`,
            sk: `${baseUrl}/sk/podcasts/${podcast.id}`,
            hu: `${baseUrl}/hu/podcasts/${podcast.id}`,
          },
        },
      })
    }
  }

  return [...staticUrls, ...podcastUrls]
}