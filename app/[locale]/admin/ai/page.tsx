'use client'
import AdminLayout from '@/app/components/admin/AdminLayout'
import React from 'react'
import { createAzureSpeech } from '../_actions/podcastAzureActions'
import { createElevenlabsSpeech } from '../_actions/podcastElevenlabsActions'
import { voices } from '../_actions/podcastElevenlabsActions'
import { Brain, Mic, VolumeX } from 'lucide-react'

const AI = () => {
  const start = async () => {
    const voiceType = 'Lukas'
    const text = `Dobrý deň ja som ${voiceType}, hovorím po slovensky.`
    const podcastTitle = 'azureTitul'

    await createAzureSpeech(podcastTitle, voiceType, text)
  }
  
  const startEleven = async () => {
    const voiceType = 'Jessica'
    const text = `Dobrý deň ja som ${voiceType}, hovorím po slovensky.`
    const podcastTitle = '11labs'

    await createElevenlabsSpeech(podcastTitle, voiceType, text)
  }
  
  const getVoices = async () => {
    await voices()
  }

  const aiServices = [
    {
      title: 'Azure Text-to-Speech',
      description: 'Test Azure TTS with Slovak voice',
      action: start,
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
      title: 'ElevenLabs TTS',
      description: 'Test ElevenLabs voice synthesis',
      action: startEleven,
      icon: Mic,
      color: 'from-purple-500 to-purple-600', 
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20'
    },
    {
      title: 'Get ElevenLabs Voices',
      description: 'Fetch available voice models',
      action: getVoices,
      icon: VolumeX,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20'
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">AI Services</h1>
          <p className="mt-2 text-gray-400">Test and manage AI voice generation services</p>
        </div>

        {/* AI Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {aiServices.map((service) => {
            const Icon = service.icon
            return (
              <div
                key={service.title}
                className={`p-6 rounded-xl border border-white/10 transition-all duration-200 ${service.bgColor} hover:border-white/20`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${service.color} flex-shrink-0`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {service.description}
                    </p>
                    <button
                      onClick={service.action}
                      className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/20 transition-all duration-200 hover:border-white/30"
                    >
                      Test Service
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Information Panel */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Service Information</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium text-white">Azure TTS</h3>
                <p className="text-sm text-gray-400">Microsoft's neural voice synthesis with Slovak language support</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium text-white">ElevenLabs</h3>
                <p className="text-sm text-gray-400">Advanced AI voice cloning and synthesis technology</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AI
