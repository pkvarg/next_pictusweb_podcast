'use client'

import type { ReactNode } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import {
  ArrowLeft,
  Settings,
  Users,
  BellRing,
  Clock,
  Smartphone,
  Car,
  CalendarPlus,
  CalendarCheck,
  CheckCircle2,
  Info,
} from 'lucide-react'

// Bold chunks for next-intl rich text ( <b>…</b> in the messages ).
const B = { b: (chunks: ReactNode) => <strong>{chunks}</strong> }

function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="mt-4 w-full rounded-xl border border-white/10"
    />
  )
}

function Step({
  n,
  icon,
  title,
  children,
  img,
  alt,
  krok,
}: {
  n: number
  icon: ReactNode
  title: string
  children: ReactNode
  img: string
  alt: string
  krok: string
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-pictus-lime/15 text-pictus-lime flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-xs text-pictus-lime font-medium">
            {krok} {n}
          </div>
          <h2 className="text-lg font-medium leading-tight">{title}</h2>
        </div>
      </div>
      <div className="text-sm text-gray-300 leading-relaxed space-y-2">{children}</div>
      <Shot src={img} alt={alt} />
    </div>
  )
}

export default function CarCareGetStartedView() {
  const t = useTranslations('CarCare')
  const g = (k: string) => t(`getStarted.${k}`)
  const gr = (k: string) => t.rich(`getStarted.${k}`, B)
  const krok = g('krok')
  const locale = useLocale()
  const loc = ['sk', 'en', 'hu'].includes(locale) ? locale : 'sk'
  const img = (n: number) => `/carcare/guide/${loc}/step${n}.png`

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-5">
        <Link
          href="/client/my-fleet/notifications"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-pictus-white"
        >
          <ArrowLeft className="w-4 h-4" /> {g('back')}
        </Link>

        <header className="space-y-2">
          <h1 className="text-3xl font-light">{g('title')}</h1>
          <p className="text-gray-400">{g('subtitle')}</p>
        </header>

        <div className="flex items-start gap-2 rounded-2xl bg-pictus-lime/5 border border-pictus-lime/20 p-4 text-sm text-gray-300">
          <Info className="w-4 h-4 text-pictus-lime shrink-0 mt-0.5" />
          <p>{gr('intro')}</p>
        </div>

        <Step
          n={1}
          krok={krok}
          icon={<Settings className="w-5 h-5" />}
          title={g('s1.title')}
          img={img(1)}
          alt={g('s1.shot')}
        >
          <p>{gr('s1.body')}</p>
        </Step>

        <Step
          n={2}
          krok={krok}
          icon={<Users className="w-5 h-5" />}
          title={g('s2.title')}
          img={img(2)}
          alt={g('s2.shot')}
        >
          <p>{gr('s2.body')}</p>
        </Step>

        <Step
          n={3}
          krok={krok}
          icon={<BellRing className="w-5 h-5" />}
          title={g('s3.title')}
          img={img(3)}
          alt={g('s3.shot')}
        >
          <p>{gr('s3.body')}</p>
          <p className="text-gray-400">{g('s3.note')}</p>
        </Step>

        <Step
          n={4}
          krok={krok}
          icon={<Clock className="w-5 h-5" />}
          title={g('s4.title')}
          img={img(4)}
          alt={g('s4.shot')}
        >
          <p>{gr('s4.body')}</p>
        </Step>

        <Step
          n={5}
          krok={krok}
          icon={<Smartphone className="w-5 h-5" />}
          title={g('s5.title')}
          img={img(5)}
          alt={g('s5.shot')}
        >
          <p>{gr('s5.body')}</p>
        </Step>

        <div className="rounded-2xl bg-pictus-lime/10 border border-pictus-lime/25 p-4 text-sm text-gray-200">
          {gr('bannerSettings')}
        </div>

        <Step
          n={6}
          krok={krok}
          icon={<Car className="w-5 h-5" />}
          title={g('s6.title')}
          img={img(6)}
          alt={g('s6.shot')}
        >
          <p>{gr('s6.body')}</p>
        </Step>

        <Step
          n={7}
          krok={krok}
          icon={<CalendarPlus className="w-5 h-5" />}
          title={g('s7.title')}
          img={img(7)}
          alt={g('s7.shot')}
        >
          <p>{gr('s7.body')}</p>
          <p>{gr('s7.body2')}</p>
        </Step>

        <Step
          n={8}
          krok={krok}
          icon={<CalendarCheck className="w-5 h-5" />}
          title={g('s8.title')}
          img={img(8)}
          alt={g('s8.shot')}
        >
          <p>{gr('s8.body')}</p>
          <p>{gr('s8.body2')}</p>
        </Step>

        <Step
          n={9}
          krok={krok}
          icon={<CheckCircle2 className="w-5 h-5" />}
          title={g('s9.title')}
          img={img(9)}
          alt={g('s9.shot')}
        >
          <p>{gr('s9.body')}</p>
        </Step>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-sm text-gray-300">
          <h2 className="text-base font-medium text-pictus-white mb-1">{g('doneTitle')}</h2>
          <p>{g('doneBody')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/client/my-fleet/notifications"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-pictus-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/10"
            >
              <Settings className="w-4 h-4" /> {g('toSettings')}
            </Link>
            <Link
              href="/client/my-fleet"
              className="inline-flex items-center gap-2 bg-pictus-lime text-pictus-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-pictus-lime600"
            >
              <Car className="w-4 h-4" /> {g('toHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
