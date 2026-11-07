import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-light text-white/90">404</p>
      <h1 className="mt-4 text-2xl font-light text-white/90">Stránka sa nenašla</h1>
      <p className="mt-2 text-gray-400">Táto stránka neexistuje alebo bola presunutá.</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#b6e036] px-5 py-2.5 font-semibold text-[#141511] hover:opacity-90 transition-opacity"
      >
        <Home className="w-4 h-4" /> Domov
      </Link>
    </div>
  )
}
