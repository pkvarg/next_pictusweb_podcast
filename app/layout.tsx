import { prodLogger } from '@/lib/prodLogger'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  prodLogger.serverComponentStart('RootLayout')

  try {
    prodLogger.serverComponentEnd('RootLayout')
    return children
  } catch (error) {
    prodLogger.error('Error in RootLayout', {
      component: 'RootLayout',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}
