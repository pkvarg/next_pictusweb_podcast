'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const fontSystem = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const TradeRules = () => {
  const t = useTranslations('Home')
  const [openTradeRules, setOpenTradeRules] = useState<boolean>(false)
  return (
    <div
      id="trade-rules"
      className="max-w-4xl mx-auto px-6 py-6 mb-8"
      style={fontSystem}
    >
      <button
        onClick={() => setOpenTradeRules((prev) => !prev)}
        className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl transition-all duration-300 hover:bg-white/[0.03] group"
        style={{
          background: openTradeRules ? 'rgba(255,255,255,0.02)' : 'transparent',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
        }}
      >
        <span className="font-brutal-milk text-xl md:text-2xl text-[#F8F8F8]/80 group-hover:text-white transition-colors">
          {t('tradeRulesTitle')}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-pictus-lime/60 transition-transform duration-300 ${openTradeRules ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {openTradeRules && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-8 pb-4 text-[#F8F8F8]/60 text-[15px] font-light leading-relaxed space-y-4 text-justify">
              <h2 className="text-center text-xl md:text-2xl text-white font-brutal-milk mb-2">{t('tradeRulesFleetSyncTitle')}</h2>
              <p className="text-center text-xs text-[#F8F8F8]/30 mb-6">{t('tradeRulesFleetSyncSubtitle')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection1Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection1Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection2Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection2Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection3Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection3Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection4Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection4Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection5Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection5Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection6Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection6Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection7Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection7Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection8Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection8Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection9Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection9Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection10Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection10Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection11Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection11Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection12Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection12Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection13Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection13Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection14Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection14Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncSection15Title')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection15Text')}</p>

              <h3 className="text-white font-medium mt-6">{t('tradeRulesFleetSyncContactTitle')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncContactText')}</p>

              <div className="border-t border-white/[0.06] my-8 pt-8">
                <h3 className="text-white font-medium mt-8">{t('tradeRulesSection1Title')}</h3>
                <p>{t('tradeRulesSection1Text')}</p>
                <h3 className="text-white font-medium mt-6">{t('tradeRulesSection2Title')}</h3>
                <p>{t('tradeRulesSection2Text')}</p>

                <h3 className="text-white font-medium mt-6">{t('tradeRulesSection3Title')}</h3>
                <p>{t('tradeRulesSection3Text')}</p>

                <h3 className="text-white font-medium mt-6">{t('tradeRulesSection4Title')}</h3>
                <p>{t('tradeRulesSection4Text')}</p>

                <h3 className="text-white font-medium mt-6">{t('tradeRulesSection5Title')}</h3>
                <p>{t('tradeRulesSection5Text')}</p>

                <h3 className="text-white font-medium mt-6">{t('tradeRulesSection6Title')}</h3>
                <p>{t('tradeRulesSection6Text')}</p>

                <h3 className="text-white font-medium mt-6">{t('tradeRulesSection7Title')}</h3>
                <p>{t('tradeRulesSection7Text')}</p>

                <h3 className="text-white font-medium mt-6">{t('tradeRulesSection8Title')}</h3>
                <p>{t('tradeRulesSection8Text')}</p>

                <h3 className="text-white font-medium mt-6">{t('tradeRulesSection9Title')}</h3>
                <p>{t('tradeRulesSection9Text')}</p>

                <h3 className="text-white font-medium mt-6">{t('tradeRulesSection10Title')}</h3>
                <p>{t('tradeRulesSection10Text')}</p>

                <h3 className="text-white font-medium mt-6">{t('tradeRulesSection11Title')}</h3>
                <p>{t('tradeRulesSection11Text')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TradeRules
