import type { Metadata } from 'next'
import { Yanone_Kaffeesatz } from 'next/font/google'
import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import AudioProvider from '@/app/components/podcast/AudioProvider'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'
import PodcastPlayer from '@/app/components/podcast/PodcastPlayer'
import ScrollToTop from '@/app/components/ScrollToTop'
import AuthSessionProvider from '@/app/components/SessionProvider'
import { prodLogger } from '@/lib/prodLogger'
import ClientErrorHandler from '@/app/components/ClientErrorHandler'

const inter = Yanone_Kaffeesatz({ subsets: ['latin'] })

export async function generateMetadata({ params }: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  prodLogger.serverComponentStart('generateMetadata', { hasParams: !!params })
  
  try {
    const { locale } = await params
    prodLogger.info('generateMetadata: params resolved', { locale })
    
    // Validate locale and enable static rendering
    if (!['en', 'sk', 'hu'].includes(locale)) {
      prodLogger.warn('generateMetadata: Invalid locale detected', { locale })
      // Fallback to default locale
      setRequestLocale('sk')
    } else {
      // Enable static rendering for next-intl
      setRequestLocale(locale)
    }
    
    const t = await getTranslations({ locale, namespace: 'Home' })
    prodLogger.info('generateMetadata: translations loaded', { locale, namespace: 'Home' })

    const metadata = {
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
    
    prodLogger.serverComponentEnd('generateMetadata')
    return metadata
  } catch (error) {
    prodLogger.error('Error in generateMetadata', {
      component: 'generateMetadata',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
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
  prodLogger.serverComponentStart('LocaleRootLayout', { hasParams: !!params, hasChildren: !!children })
  
  try {
    prodLogger.info('LocaleRootLayout: awaiting params')
    const { locale } = await params
    prodLogger.info('LocaleRootLayout: params resolved', { locale })
    
    // Validate locale and enable static rendering
    if (!['en', 'sk', 'hu'].includes(locale)) {
      prodLogger.warn('LocaleRootLayout: Invalid locale detected', { locale })
      // Fallback to default locale
      setRequestLocale('sk')
    } else {
      // Enable static rendering for next-intl
      setRequestLocale(locale)
    }
    
    prodLogger.info('LocaleRootLayout: loading messages')
    const messages = await getMessages()
    prodLogger.info('LocaleRootLayout: messages loaded', { messageKeys: Object.keys(messages || {}).length })

    const result = (
      <NextIntlClientProvider messages={messages}>
        <html lang={locale} className="!scroll-smooth">
          <head>
            <meta property="fb:app_id" content="627076731624225" />
          </head>
          <AuthSessionProvider>
            <AudioProvider>
              <body className={cn(inter.className)}>
                <ClientErrorHandler />
                {children}
                <Toaster />
                <PodcastPlayer />
                <ScrollToTop />
              </body>
            </AudioProvider>
          </AuthSessionProvider>
        </html>
      </NextIntlClientProvider>
    )
    
    prodLogger.serverComponentEnd('LocaleRootLayout')
    return result
  } catch (error) {
    prodLogger.error('Error in LocaleRootLayout', {
      component: 'LocaleRootLayout',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}
