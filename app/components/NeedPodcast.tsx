'use client'
import React from 'react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

const NeedPodcast = () => {
  const t = useTranslations('Home')

  return (
    <div className="mx-4 lg:mx-[10%] mt-8 mb-16">
      <h1 className="text-[27.5px] font-light my-8 text-center text-white">
        {t('podcastNeedPodcast')} {t('podcastNeedPodcastAction')}
      </h1>
      <div className="flex flex-col justify-center items-center">
        <Link
          href={`/contact`}
          className="mb-12 bg-green-500 px-8 lg:px-16 py-2 lg:py-4 rounded-xl cursor-pointer hover:bg-[#0388f4]"
        >
          {t('getInTouchButton')}
        </Link>
      </div>
    </div>
  )
}

export default NeedPodcast
