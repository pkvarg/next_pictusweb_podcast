import PictusPagesHeader from '@/app/components/home/pictus/PictusPagesHeader'
import PictusFooter from '@/app/components/home/pictus/PictusFooter'
import FleetSyncPricing from '@/app/components/FleetSyncPricing'
import FleetAnalyticsShowcase from '@/app/components/FleetAnalyticsShowcase'
import HeroVehicleCard from '@/app/components/HeroVehicleCard'
import HeroTaskOverview from '@/app/components/HeroTaskOverview'
import { Check } from 'lucide-react'
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
  const t = await getTranslations({ locale, namespace: 'Automatizations' })

  return {
    title: 'FleetSync - ' + t('metaTitle'),
    description: t('metaDescription'),
    keywords:
      'fleet management, vehicle notifications, STK Slovakia, EK reminders, vehicle tracking, fleet automation, pokuty STK, STK Slovensko, technická kontrola, emisná kontrola, termín STK, pokuta za nepredvedenie vozidla na STK, správa vozidiel, upozornenia STK, správa flotily',
    openGraph: {
      title: 'FleetSync - ' + t('metaTitle'),
      description: t('metaDescription'),
      type: 'website',
      siteName: 'pictusweb.sk',
      url: `https://www.pictusweb.sk/${locale}/fleetsync`,
      images: [
        {
          url: 'https://www.pictusweb.sk/og-image.webp',
          width: 1200,
          height: 630,
          alt: 'FleetSync by PICTUSWEB',
        },
      ],
    },
    alternates: {
      canonical:
        locale === 'sk'
          ? 'https://www.pictusweb.sk/fleetsync'
          : `https://www.pictusweb.sk/${locale}/fleetsync`,
      languages: {
        en: 'https://www.pictusweb.sk/en/fleetsync',
        sk: 'https://www.pictusweb.sk/sk/fleetsync',
        hu: 'https://www.pictusweb.sk/hu/fleetsync',
      },
    },
  }
}

export default async function Vehicles({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Automatizations')

  const heroFeatures = [
    t('heroFeature1'),
    t('heroFeature2'),
    t('heroFeature3'),
    t('heroFeature4'),
    t('heroFeature5'),
    t('heroFeature6'),
    t('heroFeature7'),
    t('heroFeature8'),
  ]

  const problems = [
    {
      emoji: '💰',
      title: t('problem1Title'),
      lead: t('problem1Price'),
      detail: t('problem1Detail'),
    },
    {
      emoji: '⏰',
      title: t('problem2Title'),
      lead: t('problem2Time'),
      detail: t('problem2Detail'),
    },
    {
      emoji: '🔧',
      title: t('problem3Title'),
      lead: t('problem3Cost'),
      detail: t('problem3Detail'),
    },
    {
      emoji: '😰',
      title: t('problem4Title'),
      lead: t('problem4Issue'),
      detail: t('problem4Detail'),
    },
  ]

  const steps = [
    { title: t('step1Title'), desc: t('step1Description') },
    { title: t('step2Title'), desc: t('step2Description') },
    { title: t('step3Title'), desc: t('step3Description') },
  ]

  return (
    <div className="pl" id="top" data-locale={locale}>
      <PictusPagesHeader />

      <main id="main">
        {/* Hero */}
        <section className="section-shell" aria-labelledby="fs-hero-title">
          <div className="layout-container">
            <div className="fs-client-bar">
              <Link className="button button-primary" href="/client">
                {t('alreadyClient')} <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="fs-hero-grid">
              <div className="fs-hero-copy">
                <p className="section-kicker">FleetSync</p>
                <h1 id="fs-hero-title">
                  {t('heroTitle1')} {t('heroTitle2')}{' '}
                  <span className="fs-hl">{t('heroTitle3')}</span>
                </h1>
                <p className="section-lede">
                  {t('heroSubtitle1')} {t('heroSubtitle2')}
                </p>
                <ul className="fs-chips">
                  {heroFeatures.map((feature) => (
                    <li className="fs-chip" key={feature}>
                      <Check /> {feature}
                    </li>
                  ))}
                </ul>
                <div className="button-row">
                  <Link
                    className="button button-primary"
                    href="/fleetsync/get-started?tier=FREE&billing=monthly"
                  >
                    {t('ctaButton2')} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="fs-hero-visual">
                <HeroVehicleCard />
                <HeroTaskOverview />
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="section-shell section-muted" aria-labelledby="fs-problem-title">
          <div className="layout-container">
            <header className="section-heading fs-heading">
              <h2 id="fs-problem-title">
                {t('problemTitle')} <span className="fs-hl">{t('problemTitleHighlight')}</span>
              </h2>
              <p>{t('problemSubtitle')}</p>
            </header>

            <div className="fs-grid-4">
              {problems.map((p) => (
                <div className="fs-card" key={p.title}>
                  <span className="fs-emoji" aria-hidden="true">
                    {p.emoji}
                  </span>
                  <h3>{p.title}</h3>
                  <p className="fs-lead">{p.lead}</p>
                  <p>{p.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="section-shell" aria-labelledby="fs-solution-title">
          <div className="layout-container">
            <header className="section-heading fs-heading">
              <h2 id="fs-solution-title">
                {t('solutionTitle')} <span className="fs-hl">{t('solutionTitleHighlight')}</span>
              </h2>
              <p>{t('solutionSubtitle')}</p>
            </header>

            <div className="fs-grid-3">
              {steps.map((step, index) => (
                <div className="fs-step" key={step.title}>
                  <span className="fs-step-num">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics showcase */}
        <section className="section-shell section-muted" aria-labelledby="fs-analytics-title">
          <div className="layout-container">
            <header className="section-heading fs-heading">
              <h2 id="fs-analytics-title">
                {t('analyticsShowcaseTitle')}{' '}
                <span className="fs-hl">{t('analyticsShowcaseHighlight')}</span>
              </h2>
              <p>{t('analyticsShowcaseSubtitle')}</p>
            </header>
            <FleetAnalyticsShowcase />
          </div>
        </section>

        {/* Pricing */}
        <FleetSyncPricing
          translations={{
            pricingTitle: t('pricingTitle'),
            pricingTitleHighlight: t('pricingTitleHighlight'),
            pricingSubtitle: t('pricingSubtitle'),
            monthly: t('monthly'),
            yearly: t('yearly'),
            yearlySave: t('yearlySave'),
            perVehicle: t('perVehicle'),
            perMonth: t('perMonth'),
            perYear: t('perYear'),
            free: t('free'),
            freeFeatures: [
              t('freeFeatures1'),
              t('freeFeatures2'),
              t('freeFeatures3'),
              t('freeFeatures4'),
              t('freeFeatures5'),
              t('freeFeatures6'),
              t('freeFeatures7'),
            ],
            freeButton: t('freeButton'),
            freeContact: t('freeContact'),
            freePlanLimit: t('freePlanLimit'),
            basic: t('basic'),
            basicFeatures: [
              t('basicFeatures1'),
              t('basicFeatures2'),
              t('basicFeatures3'),
              t('basicFeatures4'),
              t('basicFeatures5'),
              t('basicFeatures6'),
              t('basicFeatures7'),
              t('basicFeatures8'),
            ],
            basicButton: t('basicButton'),
            basicContact: t('basicContact'),
            basicPopular: t('basicPopular'),
            business: t('business'),
            businessFeatures: [
              t('businessFeatures1'),
              t('businessFeatures2'),
              t('businessFeatures3'),
              t('businessFeatures10'),
              t('businessFeatures4'),
              t('businessFeatures6'),
              t('businessFeatures11'),
              t('businessFeatures7'),
              t('businessFeatures8'),
              t('businessFeatures9'),
            ],
            businessButton: t('businessButton'),
            businessContact: t('businessContact'),
          }}
        />

        {/* Final CTA */}
        <section className="section-shell section-muted" aria-labelledby="fs-cta-title">
          <div className="layout-container">
            <header className="section-heading fs-heading" style={{ marginBottom: 0 }}>
              <h2 id="fs-cta-title">
                {t('ctaTitle')} <span className="fs-hl">{t('ctaTitleHighlight')}</span>
              </h2>
              <p>{t('ctaSubtitle1')}</p>
            </header>
            <div className="fs-cta-actions">
              <Link
                className="button button-primary"
                href="/fleetsync/get-started?tier=FREE&billing=monthly"
              >
                {t('ctaButton2')} <span aria-hidden="true">→</span>
              </Link>
              <Link
                className="button button-secondary"
                href={`/contact?subject=${encodeURIComponent(t('contactCta1'))}`}
              >
                {t('ctaButton1')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PictusFooter homeBase={`/${locale}`} />
    </div>
  )
}
