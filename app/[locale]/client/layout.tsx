import ImpersonationBanner from '@/app/components/ImpersonationBanner'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ImpersonationBanner />
      {children}
    </>
  )
}
