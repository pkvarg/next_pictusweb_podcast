import PictusPagesHeader from '@/app/components/home/pictus/PictusPagesHeader'
import PictusFooter from '@/app/components/home/pictus/PictusFooter'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'PicDocs' })

  return {
    title: 'PicDocs - ' + t('landingTitle'),
    description: t('landingSubtitle'),
    alternates: {
      canonical:
        locale === 'sk'
          ? 'https://www.pictusweb.sk/picdocs'
          : `https://www.pictusweb.sk/${locale}/picdocs`,
      languages: {
        en: 'https://www.pictusweb.sk/en/picdocs',
        sk: 'https://www.pictusweb.sk/sk/picdocs',
        hu: 'https://www.pictusweb.sk/hu/picdocs',
      },
    },
  }
}

export default async function PicDocs({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('PicDocs')

  return (
    <div className="pl" id="top" data-locale={locale}>
      <PictusPagesHeader />

      <main id="main">
        <section className="section-shell" aria-labelledby="pd-hero-title">
          <div className="layout-container">
            <div className="fs-hero-copy">
              <p className="section-kicker">PicDocs</p>
              <h1 id="pd-hero-title">{t('landingTitle')}</h1>
              <p className="section-lede">{t('landingSubtitle')}</p>
              <div className="button-row">
                <Link className="button button-primary" href="/auth/login">
                  {t('loginCta')} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PictusFooter homeBase={`/${locale}`} />
    </div>
  )
}
