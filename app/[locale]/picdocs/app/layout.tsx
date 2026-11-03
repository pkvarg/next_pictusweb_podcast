import ImpersonationBanner from '@/app/components/ImpersonationBanner'

export default function PicDocsAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ImpersonationBanner />
      {children}
    </>
  )
}
