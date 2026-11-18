import ImpersonationBanner from '@/app/components/ImpersonationBanner'

export default function PicDocsAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-ui">
      <ImpersonationBanner />
      {children}
    </div>
  )
}
