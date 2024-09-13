'use client'
import React, { useState, useEffect } from 'react'

import { useTranslations } from 'next-intl'
import { getVisitors } from '@/lib/visitorsCounter'

const Counter = () => {
  const t = useTranslations('Home')
  const [count, setCount] = useState(0)

  useEffect(() => {
    const visitorsCount = async () => {
      const data = await getVisitors()
      if (data.count?.count) setCount(data.count.count)
    }
    visitorsCount()
  }, [])

  return (
    <div className='m-4 text-yellow-300 text-[30px]'>
      <h1 className='text-center'>
        {' '}
        {t('counterVisitors')}: {count}
      </h1>
    </div>
  )
}

export default Counter
