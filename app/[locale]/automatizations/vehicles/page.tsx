import Footer from '@/app/components/Footer'
import PagesHeader from '@/app/components/PagesHeader'
import { CheckCircle, Calculator, BarChart3, Users, Calendar, Bell } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'

export default async function Vehicles({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  // Enable static rendering for next-intl
  setRequestLocale(locale)

  const t = await getTranslations('Automatizations')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      <PagesHeader />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl lg:text-6xl font-light leading-tight text-center">FleetSync</h1>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-light mb-6 leading-tight">
              <br />
              {t('heroTitle1')}
              <br />
              {t('heroTitle2')}
              <br />
              <span className="text-purple-400">{t('heroTitle3')}</span>
            </h2>
            <p className="text-2xl text-white mb-8 leading-relaxed font-light">
              {t('heroSubtitle1')} <br /> {t('heroSubtitle2')}
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature1')}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature2')}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature3')}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature4')}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature5')}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature6')}</span>
              </div>
            </div>
            <Link
              href={`/contact?subject=${encodeURIComponent(t('contactHero'))}`}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-full text-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              {t('heroButton')}
            </Link>
          </div>

          {/* Client Dashboard Mockup */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-6 backdrop-blur-sm border border-purple-500/30">
              {/* Dashboard Header */}
              <div className="bg-white/10 rounded-2xl p-4 mb-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="font-normal text-2xl text-white">{t('dashboardTitle')}</div>
                      <div className="text-white text-lg">{t('dashboardSubtitle')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-400" />
                    <span className="bg-orange-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                      3
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-md text-white">{t('dashboardTotalVehicles')}</div>
                      <div className="text-xl font-bold text-white">12</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-md text-white">{t('dashboardThisMonth')}</div>
                      <div className="text-xl font-bold text-white">2</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-xl font-normal text-white mb-4 flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  {t('dashboardUpcomingTasks')}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-white font-normal">{t('dashboardTechInspection')}</span>
                    <span className="text-red-500 font-normal">{t('dashboardDays7')}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-white font-normal">{t('dashboardWinterTires')}</span>
                    <span className="text-orange-400 font-normal">{t('dashboardDays14')}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-white font-normal">{t('dashboardService')}</span>
                    <span className="text-green-500 font-normal">{t('dashboardCompleted')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gradient-to-r from-red-900/20 to-orange-900/20 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-6">
              {t('problemTitle')} <span className="text-red-400">{t('problemTitleHighlight')}</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-light">
              {t('problemSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-2xl font-semibold mb-2 text-red-400">{t('problem1Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem1Price')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem1Detail')}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30">
              <div className="text-3xl mb-4">⏰</div>
              <h3 className="text-2xl font-semibold mb-2 text-orange-400">{t('problem2Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem2Time')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem2Detail')}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-2xl font-semibold mb-2 text-yellow-400">{t('problem3Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem3Cost')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem3Detail')}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <div className="text-3xl mb-4">😰</div>
              <h3 className="text-2xl font-semibold mb-2 text-purple-400">{t('problem4Title')}</h3>
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
              <span className="text-green-400">{t('solutionTitleHighlight')}</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-light">
              {t('solutionSubtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/30">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('step1Title')}</h3>
              <p className="text-gray-300 leading-relaxed font-light">{t('step1Description')}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-800/30 to-green-800/30 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/30">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('step2Title')}</h3>
              <p className="text-gray-300 leading-relaxed font-light">{t('step2Description')}</p>
            </div>

            <div className="bg-gradient-to-br from-green-800/30 to-purple-800/30 rounded-2xl p-8 backdrop-blur-sm border border-green-500/30">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('step3Title')}</h3>
              <p className="text-gray-300 leading-relaxed font-light">{t('step3Description')}</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature1')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature2')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature3')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature4')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature5')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature6')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('heroFeature5')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('heroFeature6')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="bg-gradient-to-r from-green-900/20 to-blue-900/20 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-6">
              <Calculator className="w-10 h-10 inline-block mr-4 text-green-400" />
              {t('calculatorTitle')}{' '}
              <span className="text-green-400">{t('calculatorTitleHighlight')}</span>
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-green-500/30">
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
                    <span className="font-semibold">€900</span>
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
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-6">
              {t('pricingTitle')}{' '}
              <span className="text-purple-400">{t('pricingTitleHighlight')}</span>
            </h2>
            <p className="text-2xl text-gray-300 font-thin">{t('pricingSubtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-gray-500/30">
              <h3 className="text-2xl font-semibold mb-2">{t('starterTitle')}</h3>
              <div className="text-4xl font-bold mb-6">
                {t('starterPrice')}
                <span className="text-lg text-gray-400 font-thin">{t('starterPriceUnit')}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('starterFeature1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('starterFeature2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('starterFeature3')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('starterFeature4')}</span>
                </li>
              </ul>
              <Link
                href={`/contact?subject=${encodeURIComponent(t('contactStarter'))}`}
                className="block w-full bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full transition-colors text-center"
              >
                {t('starterButton')}
              </Link>
            </div>

            <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-3xl p-8 border-2 border-purple-500/50 relative">
              <h3 className="text-2xl font-semibold mb-2">{t('businessTitle')}</h3>
              <div className="text-4xl font-bold mb-6">
                {t('businessPrice')}
                <span className="text-lg text-gray-400 font-thin">{t('businessPriceUnit')}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('businessFeature1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('businessFeature2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('businessFeature3')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('businessFeature4')}</span>
                </li>
              </ul>

              <Link
                href={`/contact?subject=${encodeURIComponent(t('contactBusiness'))}`}
                className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-full transition-all transform hover:scale-105 text-center"
              >
                {t('businessButton')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className=" py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-light mb-6">
            {t('ctaTitle')} <span className="text-purple-400">{t('ctaTitleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-thin">
            {t('ctaSubtitle1')}
            <br />
            {t('ctaSubtitle2')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/contact?subject=${encodeURIComponent(t('contactCta1'))}`}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-lg font-thin hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              {t('ctaButton1')}
            </Link>
            <Link
              href={`/contact?subject=${encodeURIComponent(t('contactCta2'))}`}
              className="border border-purple-500 px-8 py-4 rounded-full text-lg font-thin hover:bg-purple-500/10 transition-colors"
            >
              {t('ctaButton2')}
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
