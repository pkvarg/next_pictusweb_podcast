'use client'
import React, { useEffect } from 'react'

const AdminAIBalance = () => {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  const startDate = '2024-01-01'
  const endDate = '2024-12-31'

  console.log('keya', apiKey)
  useEffect(() => {
    const getMyAIBalance = async () => {
      try {
        const res = await fetch(
          `https://api.openai.com/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }
        )
        console.log('res', res)
      } catch (error) {
        console.log('errorai', error)
      }
    }
    getMyAIBalance()
  }, [])
  return <div>AdminAIBalance</div>
}

export default AdminAIBalance
