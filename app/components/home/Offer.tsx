'use client'
import React from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const Offer = () => {
  const t = useTranslations('Home')

  return (
    <div id="offer" className="text-white lg:pb-[120px] font-light">
      <div className="lg:border border-white border-3 rounded-[15px] mt-0 lg:mt-[120px] lg:max-w-[75%] mx-auto">
        <h1 className="lg:text-[2.5rem] text-[2.5rem] text-center mt-20">{t('offerTitle')}</h1>
        <div className="flex lg:flex-row flex-col items-center py-16">
          <div className="lg:w-[35rem] ml-[5%]">
            <Image className="lg:w-[90%]" src="/design.webp" alt="services" width={500} height={400} />
          </div>

          <div className="lg:w-[50%] lg:mr-[5%] pl-[5%] flex flex-col lg:mt-0 mt-20 lg:gap-0 gap-20 mx-4 lg:mx-0">
            <div className="flex flex-row items-center gap-3 mt-8">
              <Image className="w-[25px] lg:w-[5%] lg:flex" src="/service-check.webp" alt="service" width={25} height={25} />
              <h3 className="text-[2rem] pt-[0px] lg:pt-[9px]"> {t('offer1')} </h3>
            </div>
            <div>
              <p className="text-[1.5rem] -mt-8 lg:mt-0"> {t('offer1desc')}</p>
            </div>
            <div className="flex flex-row items-center gap-3 -mt-8 lg:mt-0">
              <Image className="w-[25px] lg:w-[5%] lg:flex" src="/service-check.webp" alt="service" width={25} height={25} />
              <h3 className="text-[2rem] pt-[0px] lg:pt-[9px]">{t('offer2')}</h3>
            </div>
            <div>
              <p className="text-[1.5rem] -mt-8 lg:mt-0">{t('offer2desc')}</p>
            </div>
          </div>
        </div>

        {/* bottom */}
        <div className="flex lg:flex-row flex-col items-center py-16 mx-4 lg:mx-0">
          <div className="lg:w-[50%] pl-[5%] flex flex-col lg:gap-0 gap-20">
            <div className="flex flex-row items-center gap-3">
              <Image
                className="w-[25px] lg:w-[5%] lg:flex -mt-[115px] lg:mt-0"
                src="/service-check.webp"
                alt="service"
                width={25}
                height={25}
              />
              <h3 className="text-[2rem] -mt-[60px] lg:mt-[9px]"> {t('offer3')}</h3>
            </div>
            <div>
              <p className="text-[1.5rem] -mt-12 lg:mt-0">{t('offer3desc')}</p>
            </div>
            <div className="flex flex-row items-center gap-3">
              <Image
                className="w-[25px] lg:w-[5%] lg:flex -mt-[35px] lg:mt-0"
                src="/service-check.webp"
                alt="service"
                width={25}
                height={25}
              />
              <h3 className="text-[2rem] -mt-8 lg:mt-[9px]"> {t('offer4')}</h3>
            </div>
            <div>
              <p className="text-[1.5rem] -mt-8 lg:mt-0">{t('offer4desc')}</p>
            </div>
          </div>

          <div className="lg:w-[35rem] lg:ml-[14.5%]">
            <Image className="lg:w-[75%] lg:mt-0 mt-20" src="/server.webp" alt="server" width={400} height={300} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Offer
