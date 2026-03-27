interface StructuredDataProps {
  type: 'podcast' | 'website' | 'organization'
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData = {}

  switch (type) {
    case 'podcast':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'AudioObject',
        name: data.title,
        description: data.description,
        url: `https://www.pictusweb.sk/${data.locale}/podcasts/${data.id}`,
        contentUrl: data.audioPath,
        encodingFormat: 'audio/mpeg',
        duration: data.duration || 'PT0M0S',
        datePublished: data.publishedAt || data.createdAt,
        dateModified: data.updatedAt,
        inLanguage: data.english ? 'en' : 'sk',
        author: {
          '@type': 'Organization',
          name: 'Pictusweb',
          url: 'https://www.pictusweb.sk',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Pictusweb',
          url: 'https://www.pictusweb.sk',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.pictusweb.sk/og-pictusweb.jpg',
            width: 400,
            height: 400,
          },
        },
        image: {
          '@type': 'ImageObject',
          url: data.imagePath,
          width: 400,
          height: 400,
        },
        genre: data.category,
        keywords: `${data.category}, AI podcast, ${data.english ? 'english' : 'slovak'} podcast`,
        thumbnailUrl: data.imagePath,
        uploadDate: data.publishedAt || data.createdAt,
      }
      break

    case 'website':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.siteName,
        url: data.url,
        description: data.description,
        inLanguage: data.locale,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${data.url}/${data.locale}/podcasts?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
      break

    case 'organization':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Pictusweb',
        url: 'https://www.pictusweb.sk',
        logo: 'https://www.pictusweb.sk/og-pictusweb.jpg',
        description: data.description,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+421-XXX-XXX-XXX',
          contactType: 'Customer Service',
          email: 'info@pictusweb.sk',
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'SK',
          addressLocality: 'Slovakia',
        },
        sameAs: [
          'https://www.pictusweb.sk',
        ],
        services: [
          'Web Development',
          'AI Podcast Creation',
          'E-commerce Solutions',
          'Blog Development',
          'Vehicle Notification Services',
        ],
      }
      break
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}