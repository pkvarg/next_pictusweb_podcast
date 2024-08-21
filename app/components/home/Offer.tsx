'use client'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const Offer = () => {
  const t = useTranslations('Home')
  const { locale } = useParams()
  const [showOffer1, setShowOffer1] = useState<boolean>(false)
  const [showOffer2, setShowOffer2] = useState<boolean>(false)
  const [showOffer3, setShowOffer3] = useState<boolean>(false)
  const [showOffer4, setShowOffer4] = useState<boolean>(false)
  return (
    <div className='lg:border border-1 mx-4 lg:mx-[10%] mt-8 mb-16 rounded-xl'>
      <h1 className='text-[40px] mt-8 text-center'>{t('offerTitle')}</h1>
      <div className='flex flex-col justify-center items-center mx-4'>
        <div className='flex flex-col lg:flex-row justify-center items-center lg:items-between my-16 text-[30px] lg:text-[30px] lg:gap-16 lg:w-full'>
          <div className='flex flex-col gap-4 lg:w-[50%]'>
            <p
              className='bg-[#1F2937] cursor-pointer text-center p-8 hover:text-green-500 w-full rounded-2xl'
              onClick={() => setShowOffer1((prev) => !prev)}
            >
              {t('offer1')} +
            </p>
            {showOffer1 && (
              <p className='text-[#93A7B7] bg-[#1F2937] p-8  text-[25px] text-justify my-4 w-full rounded-2xl'>
                {t('offer1desc')}
              </p>
            )}
            <p
              className='bg-[#1F2937] cursor-pointer p-8 text-center hover:text-green-500 rounded-2xl'
              onClick={() => setShowOffer3((prev) => !prev)}
            >
              {t('offer3')} +
            </p>
            {showOffer3 && (
              <p className='bg-[#1F2937] text-[#93A7B7] p-8 text-[25px] text-justify w-full my-4 rounded-2xl'>
                {t('offer3desc')}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-4 lg:w-[50%]'>
            <p
              className='bg-[#1F2937] cursor-pointer p-8 text-center hover:text-green-500 rounded-2xl'
              onClick={() => setShowOffer2((prev) => !prev)}
            >
              {t('offer2')} +
            </p>
            {showOffer2 && (
              <p className=' bg-[#1F2937] text-[#93A7B7] p-8 text-[25px] text-justify w-full my-4 rounded-2xl'>
                {t('offer2desc')}
              </p>
            )}
            <p
              className='bg-[#1F2937] cursor-pointer text-center p-8 hover:text-green-500 rounded-2xl'
              onClick={() => setShowOffer4((prev) => !prev)}
            >
              {t('offer4')} +
            </p>
            {showOffer4 && (
              <p className='bg-[#1F2937] text-[#93A7B7] p-8 text-[25px] text-justify w-full my-4 rounded-2xl'>
                {t('offer4desc')}
              </p>
            )}
          </div>
        </div>
        <Link
          href={`${locale}/contact`}
          className='mb-12 bg-green-500 px-8 lg:px-16 py-2 lg:py-4 rounded-xl cursor-pointer hover:bg-[#0388f4]'
        >
          {t('offerButton')}
        </Link>
      </div>
    </div>
  )
}

export default Offer
