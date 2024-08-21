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
    // <div className='lg:border border-1 mx-4 lg:mx-[10%] mt-8 mb-16 rounded-xl'>
    //   <h1 className='text-[40px] mt-8 text-center'>{t('offerTitle')}</h1>
    //   <div className='flex flex-col justify-center items-center mx-4'>
    //     <div className='flex flex-col lg:flex-row justify-center items-center lg:items-between my-16 text-[30px] lg:text-[30px] lg:gap-16 lg:w-full'>
    //       <div className='flex flex-col gap-4 lg:w-[50%]'>
    //         <p
    //           className='bg-[#1F2937] cursor-pointer text-center p-8 hover:text-green-500 w-full rounded-2xl'
    //           onClick={() => setShowOffer1((prev) => !prev)}
    //         >
    //           {t('offer1')} +
    //         </p>
    //         {showOffer1 && (
    //           <p className='text-[#93A7B7] bg-[#1F2937] p-8  text-[25px] text-justify my-4 w-full rounded-2xl'>
    //             {t('offer1desc')}
    //           </p>
    //         )}
    //         <p
    //           className='bg-[#1F2937] cursor-pointer p-8 text-center hover:text-green-500 rounded-2xl'
    //           onClick={() => setShowOffer3((prev) => !prev)}
    //         >
    //           {t('offer3')} +
    //         </p>
    //         {showOffer3 && (
    //           <p className='bg-[#1F2937] text-[#93A7B7] p-8 text-[25px] text-justify w-full my-4 rounded-2xl'>
    //             {t('offer3desc')}
    //           </p>
    //         )}
    //       </div>

    //       <div className='flex flex-col gap-4 lg:w-[50%]'>
    //         <p
    //           className='bg-[#1F2937] cursor-pointer p-8 text-center hover:text-green-500 rounded-2xl'
    //           onClick={() => setShowOffer2((prev) => !prev)}
    //         >
    //           {t('offer2')} +
    //         </p>
    //         {showOffer2 && (
    //           <p className=' bg-[#1F2937] text-[#93A7B7] p-8 text-[25px] text-justify w-full my-4 rounded-2xl'>
    //             {t('offer2desc')}
    //           </p>
    //         )}
    //         <p
    //           className='bg-[#1F2937] cursor-pointer text-center p-8 hover:text-green-500 rounded-2xl'
    //           onClick={() => setShowOffer4((prev) => !prev)}
    //         >
    //           {t('offer4')} +
    //         </p>
    //         {showOffer4 && (
    //           <p className='bg-[#1F2937] text-[#93A7B7] p-8 text-[25px] text-justify w-full my-4 rounded-2xl'>
    //             {t('offer4desc')}
    //           </p>
    //         )}
    //       </div>
    //     </div>
    //     <Link
    //       href={`${locale}/contact`}
    //       className='mb-12 bg-green-500 px-8 lg:px-16 py-2 lg:py-4 rounded-xl cursor-pointer hover:bg-[#0388f4]'
    //     >
    //       {t('offerButton')}
    //     </Link>
    //   </div>
    // </div>

    <div className='text-white lg:pb-[120px]'>
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
