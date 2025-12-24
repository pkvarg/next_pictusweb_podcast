import { prodLogger } from '@/lib/prodLogger'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  prodLogger.serverComponentStart('RootLayout')
  
  try {
    const result = (
      <html>
        <body>
          {children}
        </body>
      </html>
    )
    prodLogger.serverComponentEnd('RootLayout')
    return result
  } catch (error) {
    prodLogger.error('Error in RootLayout', {
      component: 'RootLayout',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}
