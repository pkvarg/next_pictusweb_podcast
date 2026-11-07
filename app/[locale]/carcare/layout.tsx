import type { Metadata, Viewport } from 'next'
import CarCareServiceWorker from '@/app/components/carcare/CarCareServiceWorker'

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
      {children}
      <CarCareServiceWorker />
    </>
  )
}
