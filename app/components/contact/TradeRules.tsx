'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

const TradeRules = () => {
  const t = useTranslations('Home')
  const [openTradeRules, setOpenTradeRules] = useState<boolean>(false)
  return (
    <div
      id="trade-rules"
      className="mx-4 lg:mx-10 text-[20px] lg:text-[22.5px] text-justify flex flex-col gap-4 font-light"
    >
      <h2
        onClick={() => setOpenTradeRules((prev) => !prev)}
        className="text-center text-[30px] lg:text-[35x] cursor-pointer hover:text-[#0388f4]"
      >
{t('tradeRulesTitle')} +
      </h2>
      {openTradeRules && (
        <>
          <h2 className="text-center text-[28px] lg:text-[32px] mt-8 mb-2">{t('tradeRulesFleetSyncTitle')}</h2>
          <p className="text-center text-[16px] mb-6">{t('tradeRulesFleetSyncSubtitle')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection1Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection1Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection2Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection2Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection3Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection3Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection4Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection4Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection5Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection5Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection6Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection6Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection7Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection7Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection8Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection8Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection9Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection9Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection10Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection10Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection11Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection11Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection12Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection12Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection13Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection13Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection14Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection14Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncSection15Title')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncSection15Text')}</p>

          <h3 className="mt-4">{t('tradeRulesFleetSyncContactTitle')}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncContactText')}</p>

          <div className="border-t border-white/20 my-8 pt-8">
            <h3 className="mt-8">{t('tradeRulesSection1Title')}</h3>
            <p>{t('tradeRulesSection1Text')}</p>
            <h3>{t('tradeRulesSection2Title')}</h3>
            <p>{t('tradeRulesSection2Text')}</p>

            <h3>{t('tradeRulesSection3Title')}</h3>
            <p>{t('tradeRulesSection3Text')}</p>

            <h3>{t('tradeRulesSection4Title')}</h3>
            <p>{t('tradeRulesSection4Text')}</p>

            <h3>{t('tradeRulesSection5Title')}</h3>
            <p>{t('tradeRulesSection5Text')}</p>

            <h3>{t('tradeRulesSection6Title')}</h3>
            <p>{t('tradeRulesSection6Text')}</p>

            <h3>{t('tradeRulesSection7Title')}</h3>
            <p>{t('tradeRulesSection7Text')}</p>

            <h3>{t('tradeRulesSection8Title')}</h3>
            <p>{t('tradeRulesSection8Text')}</p>

            <h3>{t('tradeRulesSection9Title')}</h3>
            <p>{t('tradeRulesSection9Text')}</p>

            <h3>{t('tradeRulesSection10Title')}</h3>
            <p>{t('tradeRulesSection10Text')}</p>

            <h3>{t('tradeRulesSection11Title')}</h3>
            <p>{t('tradeRulesSection11Text')}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default TradeRules
