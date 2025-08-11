'use client'
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import axios from 'axios'

export interface Stats {
  id: string
  count: number
  bots: number
  visitors: number
  emails: number
  lastBot_at: Date
  lastVisitor_at: Date
  lastEmail_at: Date
}

const Counter = () => {
  const t = useTranslations('Home')
  const [countVisitors, setCountVisitors] = useState(0)
  const [countBots, setCountBots] = useState(0)
  const [countEmails, setCountEmails] = useState(0)

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const apiUrl = 'https://hono-api.pictusweb.com/api/stats/pictuswebsk'
  //const apiUrl = 'http://localhost:3013/api/stats/pictuswebsk'

  useEffect(() => {
    const getStats = async () => {
      try {
        const { data } = await axios.get(apiUrl, config)
        setCountBots(data.bots)
        setCountVisitors(data.visitors)
        setCountEmails(data.emails)
      } catch (err) {
        console.error('Error fetching bots:', err)
      }
    }

    getStats()
    // eslint-disable-next-line
  }, [])

  return (
    <div className="m-4 text-yellow-300 text-[30px] flex flex-col gap-2 text-center">
      <p>
        {t('counterVisitors')}: {countVisitors}
      </p>
      <p>
        {t('counterBots')}: {countBots}
      </p>
      <p>
        {t('counterEmails')}: {countEmails}
      </p>
    </div>
  )
}

export default Counter
