'use client'
import React from 'react'
import { motion } from 'framer-motion'

const GlassmorphismCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FF4500 100%)',
      }}
    >
      {/* Orange Gradient Background with Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Geometric shape - circle */}
        <div 
          className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'linear-gradient(45deg, #FF4500, #FF6B35)' }}
        />
        {/* Geometric shape - rotated square */}
        <div 
          className="absolute top-20 left-32 w-24 h-24 transform rotate-45 opacity-15"
          style={{ background: 'linear-gradient(45deg, #FFB347, #FF6B35)' }}
        />
      </div>

      <div className="relative z-10 p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between min-h-[400px]">
        {/* Left Side - Main Content */}
        <div className="flex-1 space-y-6 lg:pr-8">
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white text-4xl lg:text-5xl font-bold leading-tight"
          >
            Please pay attention!
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-white/90 text-lg lg:text-xl leading-relaxed space-y-2"
          >
            <p>To visit Glassy Cards, switch from <span className="font-semibold">&ldquo;👋 Hello!&rdquo;</span></p>
            <p>page to <span className="font-semibold">&ldquo;🔥 Glassy Cards&rdquo;</span> page.</p>
          </motion.div>
          
          <motion.a 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            href="https://figma.com/@simmmple" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block text-white/80 hover:text-white text-lg underline transition-colors duration-200"
          >
            figma.com/@simmmple
          </motion.a>
        </div>

        {/* Right Side - Glassmorphism Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative flex-shrink-0 w-full lg:w-80 mt-8 lg:mt-0"
        >
          {/* Glassmorphism Card */}
          <div 
            className="relative p-6 rounded-2xl backdrop-blur-md bg-white/90 border border-white/30 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Tab Navigation */}
            <div className="flex space-x-6 mb-6 border-b border-gray-200/50 pb-3">
              <button className="text-gray-800 font-semibold border-b-2 border-orange-500 pb-1">
                Layers
              </button>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                Assets
              </button>
              <div className="ml-auto flex items-center space-x-2 text-gray-600">
                <span className="text-xl">👋</span>
                <span className="text-sm font-medium">Hello!</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Pages Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-800 font-semibold text-lg">Pages</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Page List */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-xl">👋</span>
                  <span className="font-medium">Hello!</span>
                </div>
                
                <div className="pl-7 space-y-2">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <span className="text-lg">🔥</span>
                    <span>Glassy Cards</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <span className="text-lg">👑</span>
                    <span>Examples</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pointing Hand Emoji */}
          <motion.div 
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="absolute -bottom-4 -right-4 text-6xl z-20"
          >
            👉
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default GlassmorphismCard