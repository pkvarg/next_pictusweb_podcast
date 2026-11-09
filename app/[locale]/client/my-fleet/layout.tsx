import type { Metadata, Viewport } from 'next'
import CarCareServiceWorker from '@/app/components/carcare/CarCareServiceWorker'
import CarCareBottomNav from '@/app/components/carcare/CarCareBottomNav'
import CarCareLangSwitcher from '@/app/components/carcare/CarCareLangSwitcher'

export const metadata: Metadata = {
  manifest: '/carcare.webmanifest',
  appleWebApp: { capable: true, title: 'CarCare', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: '#141511',
}

export default function CarCareLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CarCareBottomNav />
      <div className="hidden md:block fixed right-3 z-50 md:top-3">
        <CarCareLangSwitcher />
      </div>
      <div className="md:pl-56">{children}</div>
      <CarCareServiceWorker />
    </>
  )
}
