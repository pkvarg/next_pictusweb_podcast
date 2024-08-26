'use client'
import AdminBack from '@/app/components/admin/AdminBack'
import React from 'react'
import azureTts from '../_actions/podcastAzureActions'

const AI = () => {
  const start = async () => {
    const text =
      'Ahoj Lukáš neurálny nie rodovo neutrálny ani nereálny slovenský ľubozvučný slovák.'

    await azureTts(text)
  }
  return (
    <div>
      <AdminBack />
      <h1 className='text-center'>AI</h1>
      <button onClick={() => start()}>Start TTS</button>
    </div>
  )
}

export default AI
