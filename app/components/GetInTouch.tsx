'use client'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const GetInTouch = () => {
  const t = useTranslations('Home')
  const { locale } = useParams()

  return (
    <div className='mx-4 lg:mx-[10%] mt-8 mb-16'>
      <h1 className='text-[35px] my-8 text-center text-green-500'>
        {t('getInTouch')}
      </h1>
      <div className='flex flex-col justify-center items-center'>
        <Link
          href={`${locale}/contact`}
          className='mb-12 bg-green-500 px-8 lg:px-16 py-2 lg:py-4 rounded-xl cursor-pointer hover:bg-[#0388f4]'
        >
          {t('getInTouchButton')}
        </Link>
      </div>
    </div>
  )
}

export default GetInTouch
