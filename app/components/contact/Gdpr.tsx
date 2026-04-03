'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const fontSystem = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const Gdpr = () => {
  const t = useTranslations('Home')
  const [openGdpr, setOpenGdpr] = useState<boolean>(false)
  return (
    <div
      id="gdpr"
      className="max-w-4xl mx-auto px-6 py-6"
      style={fontSystem}
    >
      <button
        onClick={() => setOpenGdpr((prev) => !prev)}
        className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl transition-all duration-300 hover:bg-white/[0.03] group"
        style={{
          background: openGdpr ? 'rgba(255,255,255,0.02)' : 'transparent',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
        }}
      >
        <span className="font-brutal-milk text-xl md:text-2xl text-[#F8F8F8]/80 group-hover:text-white transition-colors">
          GDPR
        </span>
        <ChevronDown
          className={`w-5 h-5 text-pictus-lime/60 transition-transform duration-300 ${openGdpr ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {openGdpr && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-8 pb-4 text-[#F8F8F8]/60 text-[15px] font-light leading-relaxed space-y-4 text-justify">
              <h2 className="text-center text-xl md:text-2xl text-white font-brutal-milk mb-6">{t('gdprFleetSyncTitle')}</h2>
              <p>{t('gdprFleetSyncText1')}</p>
              <h3 className="text-white font-medium mt-6">{t('gdprFleetSyncDataTitle')}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{t('gdprFleetSyncDataText')}</p>
              <h3 className="text-white font-medium mt-6">{t('gdprFleetSyncPurposeTitle')}</h3>
              <p>{t('gdprFleetSyncPurposeText')}</p>
              <h3 className="text-white font-medium mt-6">{t('gdprFleetSyncConsentTitle')}</h3>
              <p>{t('gdprFleetSyncConsentText')}</p>
              <h3 className="text-white font-medium mt-6">{t('gdprFleetSyncComplianceTitle')}</h3>
              <p>{t('gdprFleetSyncComplianceText')}</p>

              <div className="border-t border-white/[0.06] my-8 pt-8">
                <h2 className="text-center text-white font-brutal-milk text-xl mb-6">{t('gdprTitle')}</h2>
                <p>{t('gdprIntro')}</p>

                <h3 className="text-white font-medium mt-6">{t('gdprWhatMeansTitle')}</h3>
                <p>{t('gdprWhatMeansText')}</p>

                <h3 className="text-white font-medium mt-6">{t('gdprDataCollectedTitle')}</h3>
                <p>{t('gdprDataCollectedText')}</p>
                <h3 className="text-white font-medium mt-6">{t('gdprCookiesTitle')}</h3>
                <p>{t('gdprCookiesIntro')}</p>

                <h4 className="text-white/80 font-medium mt-4">{t('gdprCookiesEssentialTitle')}</h4>
                <p style={{ whiteSpace: 'pre-line' }}>{t('gdprCookiesEssentialText')}</p>

                <h4 className="text-white/80 font-medium mt-4">{t('gdprCookiesAnalyticsTitle')}</h4>
                <p style={{ whiteSpace: 'pre-line' }}>{t('gdprCookiesAnalyticsText')}</p>

                <h4 className="text-white/80 font-medium mt-4">{t('gdprCookiesNotUsedTitle')}</h4>
                <p style={{ whiteSpace: 'pre-line' }}>{t('gdprCookiesNotUsedText')}</p>

                <h4 className="text-white/80 font-medium mt-4">{t('gdprCookiesManagementTitle')}</h4>
                <p style={{ whiteSpace: 'pre-line' }}>{t('gdprCookiesManagementText')}</p>

                <h4 className="text-white/80 font-medium mt-4">{t('gdprCookiesVisitorsTitle')}</h4>
                <p>{t('gdprCookiesVisitorsText')}</p>
                <h3 className="text-white font-medium mt-6">{t('gdprOtherDataTitle')}</h3>
                <p>{t('gdprOtherDataText')}</p>
                <h3 className="text-white font-medium mt-6">{t('gdprProcessingTitle')}</h3>
                <p>{t('gdprProcessingText')}</p>

                <h3 className="text-white font-medium mt-6">{t('gdprPurposesTitle')}</h3>
                <p>{t('gdprPurposesText')}</p>

                <h3 className="text-white font-medium mt-6">{t('gdprRetentionTitle')}</h3>
                <p>{t('gdprRetentionText')}</p>

                <h3 className="text-white font-medium mt-6">{t('gdprSecurityTitle')}</h3>
                <p>{t('gdprSecurityText')}</p>

                <h3 className="text-white font-medium mt-6">{t('gdprRightsTitle')}</h3>
                <p>{t('gdprRightsText')}</p>

                <h3 className="text-white font-medium mt-6">{t('gdprContactTitle')}</h3>
                <p>{t('gdprContactText')}</p>

                <h3 className="text-white font-medium mt-6">{t('gdprProcessorsTitle')}</h3>
                <p>
                  {t('gdprProcessorsText')}
                  <a href="https://www.hostinger.com" className="text-pictus-lime/60 hover:text-pictus-lime transition-colors"> hostinger.com</a>
                  <a href="https://www.oracle.com" className="text-pictus-lime/60 hover:text-pictus-lime transition-colors"> oracle.com</a>
                  <a href="https://www.hetzner.com" className="text-pictus-lime/60 hover:text-pictus-lime transition-colors"> hetzner.com</a>
                  <a href="https://www.vercel.com" className="text-pictus-lime/60 hover:text-pictus-lime transition-colors"> vercel.com</a>
                </p>

                <h3 className="text-white font-medium mt-6">{t('gdprThirdPartyTitle')}</h3>
                <p>{t('gdprThirdPartyText')}</p>

                <h3 className="text-white font-medium mt-6">{t('gdprNoSharingTitle')}</h3>
                <p>{t('gdprNoSharingText')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Gdpr
