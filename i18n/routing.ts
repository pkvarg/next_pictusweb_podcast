import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['en', 'sk', 'hu'],
  defaultLocale: 'sk',
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)

// import { notFound } from 'next/navigation'
// import { getRequestConfig } from 'next-intl/server'

// const locales = ['en', 'sk']

// export default getRequestConfig(async ({ locale }) => {
//   if (!locales.includes(locale as any)) notFound()

//   return {
//     messages: (await import(`./messages/${locale}.json`)).default,
//   }
// })
