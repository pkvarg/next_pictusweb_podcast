import ImpersonationBanner from '@/app/components/ImpersonationBanner'
import FeedbackButton from '@/app/components/client/FeedbackButton'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-ui">
      <ImpersonationBanner />
      {children}
      <FeedbackButton />
    </div>
  )
}
