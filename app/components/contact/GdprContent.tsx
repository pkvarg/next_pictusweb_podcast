'use client'
import React from 'react'
import { useTranslations } from 'next-intl'

const GdprContent = () => {
  const t = useTranslations('Home')
  return (
    <article className="prose">
      <h2>{t('gdprFleetSyncTitle')}</h2>
      <p>{t('gdprFleetSyncText1')}</p>
      <h3>{t('gdprFleetSyncDataTitle')}</h3>
      <p style={{ whiteSpace: 'pre-line' }}>{t('gdprFleetSyncDataText')}</p>
      <h3>{t('gdprFleetSyncPurposeTitle')}</h3>
      <p>{t('gdprFleetSyncPurposeText')}</p>
      <h3>{t('gdprFleetSyncConsentTitle')}</h3>
      <p>{t('gdprFleetSyncConsentText')}</p>
      <h3>{t('gdprFleetSyncComplianceTitle')}</h3>
      <p>{t('gdprFleetSyncComplianceText')}</p>

      <div className="prose-divider">
        <h2>{t('gdprTitle')}</h2>
        <p>{t('gdprIntro')}</p>

        <h3>{t('gdprWhatMeansTitle')}</h3>
        <p>{t('gdprWhatMeansText')}</p>

        <h3>{t('gdprDataCollectedTitle')}</h3>
        <p>{t('gdprDataCollectedText')}</p>

        <h3>{t('gdprCookiesTitle')}</h3>
        <p>{t('gdprCookiesIntro')}</p>

        <h4>{t('gdprCookiesEssentialTitle')}</h4>
        <p style={{ whiteSpace: 'pre-line' }}>{t('gdprCookiesEssentialText')}</p>

        <h4>{t('gdprCookiesAnalyticsTitle')}</h4>
        <p style={{ whiteSpace: 'pre-line' }}>{t('gdprCookiesAnalyticsText')}</p>

        <h4>{t('gdprCookiesNotUsedTitle')}</h4>
        <p style={{ whiteSpace: 'pre-line' }}>{t('gdprCookiesNotUsedText')}</p>

        <h4>{t('gdprCookiesManagementTitle')}</h4>
        <p style={{ whiteSpace: 'pre-line' }}>{t('gdprCookiesManagementText')}</p>

        <h4>{t('gdprCookiesVisitorsTitle')}</h4>
        <p>{t('gdprCookiesVisitorsText')}</p>

        <h3>{t('gdprOtherDataTitle')}</h3>
        <p>{t('gdprOtherDataText')}</p>

        <h3>{t('gdprProcessingTitle')}</h3>
        <p>{t('gdprProcessingText')}</p>

        <h3>{t('gdprPurposesTitle')}</h3>
        <p>{t('gdprPurposesText')}</p>

        <h3>{t('gdprRetentionTitle')}</h3>
        <p>{t('gdprRetentionText')}</p>

        <h3>{t('gdprSecurityTitle')}</h3>
        <p>{t('gdprSecurityText')}</p>

        <h3>{t('gdprRightsTitle')}</h3>
        <p>{t('gdprRightsText')}</p>

        <h3>{t('gdprContactTitle')}</h3>
        <p>{t('gdprContactText')}</p>

        <h3>{t('gdprProcessorsTitle')}</h3>
        <p>
          {t('gdprProcessorsText')}
          <a href="https://www.hostinger.com"> hostinger.com</a>
          <a href="https://www.oracle.com"> oracle.com</a>
          <a href="https://www.hetzner.com"> hetzner.com</a>
          <a href="https://www.vercel.com"> vercel.com</a>
        </p>

        <h3>{t('gdprThirdPartyTitle')}</h3>
        <p>{t('gdprThirdPartyText')}</p>

        <h3>{t('gdprNoSharingTitle')}</h3>
        <p>{t('gdprNoSharingText')}</p>
      </div>
    </article>
  )
}

export default GdprContent
