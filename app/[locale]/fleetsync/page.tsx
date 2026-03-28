import Footer from '@/app/components/Footer'
import PagesHeader from '@/app/components/PagesHeader'
import FleetSyncPricing from '@/app/components/FleetSyncPricing'
import { CheckCircle, Calculator } from 'lucide-react'
import Image from 'next/image'
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
      'fleet management, vehicle notifications, STK Slovakia, EK reminders, vehicle tracking, fleet automation',
    openGraph: {
      title: 'FleetSync - ' + t('metaTitle'),
      description: t('metaDescription'),
      type: 'website',
      siteName: 'pictusweb.sk',
      url: `https://www.pictusweb.sk/${locale}/fleetsync`,
      images: [
        {
          url: 'https://www.pictusweb.sk/og-pictusweb.jpg',
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

  // Enable static rendering for next-intl
  setRequestLocale(locale)

  const t = await getTranslations('Automatizations')

  const tHome = await getTranslations('Home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white font-brutal-milk">
      <PagesHeader />
      {/* Testing banner */}
      {/* <div className="flex justify-center pt-4">
        <div className="px-6 py-2.5 rounded-full border border-red-500/50 bg-red-600/20 backdrop-blur-sm">
          <span className="text-red-400 text-[17px] tracking-wide">
            !! {tHome('testingBanner')}{' '}
            <a href="https://www.pictusweb.sk" target="_blank" rel="noopener noreferrer" className="underline text-red-300 hover:text-white transition-colors font-medium">
              pictusweb.sk
            </a>
            {' '}!!
          </span>
        </div>
      </div> */}
      {/* Already a client banner */}
      <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-center md:justify-end">
        <Link
          href="/client"
          className="bg-gradient-to-r from-pictus-lime to-pictus-lime600 px-8 py-3 rounded-full text-lg font-normal text-pictus-black hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all transform hover:scale-105 shadow-lg hover:shadow-pictus-lime/50"
        >
          {t('alreadyClient')}
        </Link>
      </div>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl lg:text-6xl font-light leading-tight text-center">FleetSync</h1>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl lg:text-5xl font-light mb-6 leading-tight">
              <br />
              {t('heroTitle1')}
              <br />
              {t('heroTitle2')}
              <br />
              <span className="text-pictus-lime">{t('heroTitle3')}</span>
            </h2>
            <p className="text-2xl text-pictus-white mb-8 leading-relaxed font-light">
              {t('heroSubtitle1')} <br /> {t('heroSubtitle2')}
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-pictus-white/5 border border-pictus-lime/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature1')}</span>
              </div>
              <div className="flex items-center gap-2 bg-pictus-white/5 border border-pictus-lime/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature2')}</span>
              </div>
              <div className="flex items-center gap-2 bg-pictus-white/5 border border-pictus-lime/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature3')}</span>
              </div>
              <div className="flex items-center gap-2 bg-pictus-white/5 border border-pictus-lime/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature4')}</span>
              </div>
              <div className="flex items-center gap-2 bg-pictus-white/5 border border-pictus-lime/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature5')}</span>
              </div>
              <div className="flex items-center gap-2 bg-pictus-white/5 border border-pictus-lime/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature6')}</span>
              </div>
              <div className="flex items-center gap-2 bg-pictus-white/5 border border-pictus-lime/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature7')}</span>
              </div>
              <div className="flex items-center gap-2 bg-pictus-white/5 border border-pictus-lime/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature8')}</span>
              </div>
            </div>
          </div>

          {/* Client Dashboard Screenshots */}
          <div className="relative flex flex-col gap-4 lg:mt-16">
            <Image
              src="/fleetsync-vehicle-card.webp"
              alt="FleetSync vehicle card"
              width={570}
              height={649}
              className="rounded-2xl shadow-2xl"
            />
            <Image
              src="/fleetsync-task-overview.webp"
              alt="FleetSync task overview"
              width={1152}
              height={445}
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Problem Section */}

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-6">
              {t('problemTitle')}{' '}
              <span className="text-pictus-lime">{t('problemTitleHighlight')}</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-light">
              {t('problemSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 backdrop-blur-sm rounded-2xl p-6 border border-pictus-lime/20">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-2xl font-semibold mb-2 text-pictus-lime">{t('problem1Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem1Price')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem1Detail')}</p>
            </div>

            <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 backdrop-blur-sm rounded-2xl p-6 border border-pictus-lime/20">
              <div className="text-3xl mb-4">⏰</div>
              <h3 className="text-2xl font-semibold mb-2 text-pictus-lime">{t('problem2Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem2Time')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem2Detail')}</p>
            </div>

            <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 backdrop-blur-sm rounded-2xl p-6 border border-pictus-lime/20">
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-2xl font-semibold mb-2 text-pictus-lime">{t('problem3Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem3Cost')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem3Detail')}</p>
            </div>

            <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 backdrop-blur-sm rounded-2xl p-6 border border-pictus-lime/20">
              <div className="text-3xl mb-4">😰</div>
              <h3 className="text-2xl font-semibold mb-2 text-pictus-lime">{t('problem4Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem4Issue')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem4Detail')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-6">
              {t('solutionTitle')}{' '}
              <span className="text-pictus-lime">{t('solutionTitleHighlight')}</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-light">
              {t('solutionSubtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 rounded-2xl p-8 backdrop-blur-sm border border-pictus-lime/20">
              <div className="w-16 h-16 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-pictus-black">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('step1Title')}</h3>
              <p className="text-gray-300 leading-relaxed font-light">{t('step1Description')}</p>
            </div>

            <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 rounded-2xl p-8 backdrop-blur-sm border border-pictus-lime/20">
              <div className="w-16 h-16 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-pictus-black">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('step2Title')}</h3>
              <p className="text-gray-300 leading-relaxed font-light">{t('step2Description')}</p>
            </div>

            <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 rounded-2xl p-8 backdrop-blur-sm border border-pictus-lime/20">
              <div className="w-16 h-16 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-pictus-black">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('step3Title')}</h3>
              <p className="text-gray-300 leading-relaxed font-light">{t('step3Description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      {/* <section className="bg-gradient-to-r from-green-900/20 to-blue-900/20 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-6">
              <Calculator className="w-10 h-10 inline-block mr-4 text-green-400" />
              {t('calculatorTitle')}{' '}
              <span className="text-green-400">{t('calculatorTitleHighlight')}</span>
            </h2>
          </div>

          <div className="bg-pictus-white/10 backdrop-blur-sm rounded-3xl p-8 border border-green-500/30">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-green-400">
                  {t('calculatorWithout')}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorFine')}</span>
                    <span className="font-semibold">€750</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorTime')}</span>
                    <span className="font-semibold">€720</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorRepairs')}</span>
                    <span className="font-semibold">€1,200</span>
                  </div>
                  <div className="border-t border-gray-600 pt-4 font-thin">
                    <div className="flex justify-between items-center text-xl text-red-400">
                      <span>{t('calculatorTotal')}</span>
                      <span>€2,670</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6 text-blue-400">{t('calculatorWith')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorServiceCost')}</span>
                    <span className="font-semibold">€500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorFines')}</span>
                    <span className="font-semibold text-green-400">€0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorTimeAdmin')}</span>
                    <span className="font-semibold text-green-400">€0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorAdditionalRepairs')}</span>
                    <span className="font-semibold text-green-400">€0</span>
                  </div>
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between items-center text-xl font-thin text-green-400">
                      <span>{t('calculatorSavings')}</span>
                      <span>€1,770</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="text-3xl font-bold text-green-400 mb-2">{t('calculatorROI')}</div>
              <p className="text-gray-300">{t('calculatorROIDesc')}</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Pricing Section */}
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
            // t('businessFeatures5'),
            t('businessFeatures6'),
            t('businessFeatures7'),
            t('businessFeatures8'),
            t('businessFeatures9'),
          ],
          businessButton: t('businessButton'),
          businessContact: t('businessContact'),
        }}
      />

      {/* CTA Section */}
      <section className=" py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-light mb-6">
            {t('ctaTitle')} <span className="text-pictus-lime">{t('ctaTitleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-thin">
            {t('ctaSubtitle1')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/fleetsync/get-started?tier=FREE&billing=monthly"
              className="bg-gradient-to-r from-pictus-lime to-pictus-lime600 px-8 py-4 rounded-full text-lg font-normal text-pictus-black hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all transform hover:scale-105 shadow-lg hover:shadow-pictus-lime/50"
            >
              {t('ctaButton2')}
            </Link>
            <Link
              href={`/contact?subject=${encodeURIComponent(t('contactCta1'))}`}
              className="px-8 py-4 rounded-full text-lg font-normal border border-pictus-white/20 hover:bg-pictus-white/10 transition-colors"
            >
              {t('ctaButton1')}
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
