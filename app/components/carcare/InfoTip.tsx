'use client'

import { Info } from 'lucide-react'

// Small info icon with a real tooltip bubble. Works on hover, keyboard focus and tap
// (focus), unlike the native `title=` attribute (slow, invisible on touch).
export default function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={text}
        className="text-gray-500 hover:text-gray-300 focus:outline-none focus-visible:text-gray-300"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-56 max-w-[70vw] -translate-x-1/2 rounded-lg border border-white/10 bg-pictus-onyx900 px-3 py-2 text-xs leading-snug text-gray-200 shadow-xl group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  )
}
