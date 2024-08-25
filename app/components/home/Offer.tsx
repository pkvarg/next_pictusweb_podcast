'use client'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const Offer = () => {
  const t = useTranslations('Home')
  const { locale } = useParams()

  return (
    <div className='text-white lg:pb-[120px] font-light'>
      <div className='lg:border border-white border-3 rounded-[15px] mt-0 lg:mt-[120px] lg:max-w-[75%] mx-auto'>
        <h1 className='lg:text-[2.5rem] text-[2.5rem] text-center mt-20'>
          {t('offerTitle')}
        </h1>
        <div className='flex lg:flex-row flex-col items-center py-16'>
          <div className='lg:w-[35rem] ml-[5%]'>
            <img className='lg:w-[90%]' src='/design.webp' alt='services' />
          </div>

          <div className='lg:w-[50%] lg:mr-[5%] pl-[5%] flex flex-col lg:mt-0 mt-20 lg:gap-0 gap-20 mx-4 lg:mx-0'>
            <div className='flex flex-row items-center gap-3 mt-8'>
              <img
                className='lg:w-[5%] lg:flex hidden'
                src='/service-check.webp'
                alt='service'
              />
              <h3 className='text-[2rem] pt-[18px]'> {t('offer1')} </h3>
            </div>
            <div>
              <p className='text-[1.5rem] -mt-8 lg:mt-0'> {t('offer1desc')}</p>
            </div>
            <div className='flex flex-row items-center gap-3'>
              <img
                className='lg:w-[5%] lg:flex hidden'
                src='/service-check.webp'
                alt='service'
              />
              <h3 className='text-[2rem] mt-[18px]'>{t('offer2')}</h3>
            </div>
            <div>
              <p className='text-[1.5rem] -mt-8 lg:mt-0'>{t('offer2desc')}</p>
            </div>
          </div>
        </div>

        {/* bottom */}
        <div className='flex lg:flex-row flex-col items-center py-16 mx-4 lg:mx-0'>
          <div className='lg:w-[50%] pl-[5%] flex flex-col lg:gap-0 gap-20'>
            <div className='flex flex-row items-center gap-3'>
              <img
                className='lg:w-[5%] lg:flex hidden'
                src='/service-check.webp'
                alt='service'
              />
              <h3 className='text-[2rem] mt-[18px]'> {t('offer3')}</h3>
            </div>
            <div>
              <p className='text-[1.5rem] -mt-8 lg:mt-0'>{t('offer3desc')}</p>
            </div>
            <div className='flex flex-row items-center gap-3'>
              <img
                className='lg:w-[5%] lg:flex hidden'
                src='/service-check.webp'
                alt='service'
              />
              <h3 className='text-[2rem] mt-[18px]'> {t('offer4')}</h3>
            </div>
            <div>
              <p className='text-[1.5rem] -mt-8 lg:mt-0'>{t('offer4desc')}</p>
            </div>
          </div>

          <div className='lg:w-[35rem] lg:ml-[14.5%]'>
            <img
              className='lg:w-[75%] lg:mt-0 mt-20'
              src='/server.webp'
              alt='server'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Offer
