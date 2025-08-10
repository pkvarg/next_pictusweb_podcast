import type { Metadata } from 'next'
import { Yanone_Kaffeesatz } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import AudioProvider from '@/app/components/podcast/AudioProvider'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'
import PodcastPlayer from '@/app/components/podcast/PodcastPlayer'
import ScrollToTop from '@/app/components/ScrollToTop'

const inter = Yanone_Kaffeesatz({ subsets: ['latin'] })

export async function generateMetadata({ params }: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      siteName: 'pictusweb.sk',
      url: 'https://www.pictusweb.sk',
      images: [{
        url: 'https://www.pictusweb.sk/pictusweb.webp',
        width: 400,
        height: 400,
        alt: 'pictusweb.sk',
      }],
    },
    alternates: {
      canonical: `https://www.pictusweb.sk/${locale}`,
      languages: {
        'en': 'https://www.pictusweb.sk/en',
        'sk': 'https://www.pictusweb.sk/sk',
        'hu': 'https://www.pictusweb.sk/hu',
      },
    },
  }
}

export async function generateStaticParams() {
  return [{ lang: 'en-US' }, { lang: 'sk' }, { lang: 'hu' }]
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: 'en' | 'sk' | 'hu' }>
}>) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <html lang={locale} className="!scroll-smooth">
        <head>
          <meta property="fb:app_id" content="627076731624225" />
        </head>
        <AudioProvider>
          <body className={cn(inter.className)}>
            {children}
            <Toaster />
            <PodcastPlayer />
            <ScrollToTop />
          </body>
        </AudioProvider>
      </html>
    </NextIntlClientProvider>
  )
}
