import type { Metadata, Viewport } from 'next'
import CarCareServiceWorker from '@/app/components/carcare/CarCareServiceWorker'
import CarCareBottomNav from '@/app/components/carcare/CarCareBottomNav'

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
      <div id="fs-scope" className="fs-scope fs-light md:pl-56">
        {children}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(localStorage.getItem('fs-theme')==='dark'){document.getElementById('fs-scope')&&document.getElementById('fs-scope').classList.remove('fs-light')}}catch(e){}",
        }}
      />
      <CarCareServiceWorker />
    </>
  )
}
