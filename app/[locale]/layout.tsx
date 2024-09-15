import type { Metadata } from 'next'
import { Yanone_Kaffeesatz } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import AudioProvider from '@/app/components/podcast/AudioProvider'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'
import PodcastPlayer from '@/app/components/podcast/PodcastPlayer'
import ScrollToTop from '@/app/components/ScrollToTop'

const inter = Yanone_Kaffeesatz({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pictusweb',
  description: 'Web development',
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: {
    locale: string
  }
}>) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <html lang={params.locale} className='!scroll-smooth'>
        <head>
          <meta property='title' content='Pictusweb development' />
          <meta
            property='description'
            content='Tvorba webstránok, blogy, podcasty, eshopy, Ai služby'
          />

          <meta property='og:title' content='Pictusweb development' />
          <meta
            property='og:description'
            content='Tvorba webstránok, blogy, podcasty, eshopy, Ai služby'
          />
          <meta property='og:type' content='website' />
          <meta property='og:site_name' content='pictusweb.sk' />
          <meta property='og:url' content='https://www.pictusweb.sk' />

          <meta
            property='og:image'
            content='https://www.pictusweb.sk/pictusweb.webp'
          />
          <meta property='og:image:type' content='png' />
          <meta property='og:image:width' content='400' />
          <meta property='og:image:height' content='400' />
          <meta property='og:image:alt' content='pictusweb.sk' />
          <meta property='fb:app_id' content='627076731624225' />
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
