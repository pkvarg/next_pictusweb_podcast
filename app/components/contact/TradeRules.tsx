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
        </>
      )}
    </div>
  )
}

export default TradeRules
