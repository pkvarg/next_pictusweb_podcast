'use client'
import React from 'react'
import { motion } from 'framer-motion'

const GlassyShowcase = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-full max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl min-h-[600px] bg-black"
    >
      {/* Diagonal Grid Pattern Background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg 
          width="100%" 
          height="100%" 
          className="absolute inset-0 opacity-10"
          viewBox="0 0 800 600"
        >
          <defs>
            <pattern id="diagonalGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0,0 L40,40 M0,40 L40,0" stroke="#ffffff" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonalGrid)" />
        </svg>
        
        {/* Subtle circles */}
        <div className="absolute top-12 right-24 w-20 h-20 rounded-full bg-white/5"></div>
        <div className="absolute bottom-20 left-12 w-16 h-16 rounded-full bg-white/5"></div>
      </div>

      <div className="relative z-10 p-8 lg:p-16 flex flex-col lg:flex-row items-start justify-between min-h-[600px]">
        {/* Left Side - Content */}
        <div className="flex-1 space-y-8 lg:pr-16 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <p className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase">
              GLASSMORPHISM CARDS
            </p>
            
            <h1 className="text-white font-black text-7xl lg:text-8xl xl:text-9xl leading-none tracking-tight">
              <span className="relative">
                Glassy
                <div 
                  className="absolute inset-0 text-gray-400 -z-10 translate-x-1 translate-y-1"
                  aria-hidden="true"
                >
                  Glassy
                </div>
              </span>
            </h1>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/80 rounded-md flex-shrink-0 mt-0.5"></div>
              <div>
                <span className="text-white text-lg font-medium">12 Trendy Glassmorphism </span>
                <span className="text-gray-400 text-lg">Cards</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/80 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center">
                <div className="w-3 h-2 bg-gray-800 rounded-sm"></div>
              </div>
              <div>
                <span className="text-white text-lg font-medium">Assets Mode </span>
                <span className="text-gray-400 text-lg">(Cards as Components)</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex-shrink-0 mt-0.5"></div>
              <div>
                <span className="text-white text-lg font-medium">Global Styles for Colors </span>
                <span className="text-gray-400 text-lg">& Texts</span>
              </div>
            </div>
          </motion.div>

          {/* Freebie Button */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="pt-4"
          >
            <button
              className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold text-white transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #9333EA 100%)',
              }}
            >
              <div className="w-6 h-6 bg-white/30 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <span className="text-lg">Freebie</span>
            </button>
          </motion.div>
        </div>

        {/* Right Side - Glassmorphism Cards Stack */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex-shrink-0 relative w-full lg:w-auto mt-12 lg:mt-0"
        >
          {/* Card Stack Container */}
          <div className="relative w-80 h-64">
            {/* Back Card (Blue) */}
            <div
              className="absolute top-8 left-8 w-72 h-56 rounded-3xl shadow-2xl transform rotate-12"
              style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(59, 130, 246, 0.6) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Vertical "Glassy" text */}
              <div className="absolute left-6 top-8 text-white/60 text-xs font-bold tracking-wider transform -rotate-90 origin-left">
                Glassy
              </div>
              
              {/* Card numbers */}
              <div className="absolute bottom-8 left-6 text-white/70 text-lg font-mono tracking-wider">
                XXXX XXXX XXXX 5280
              </div>
              
              {/* X60 indicator */}
              <div className="absolute bottom-6 right-6 text-white/60 text-sm font-mono">
                X60
              </div>
            </div>

            {/* Middle Card (Purple) */}
            <div
              className="absolute top-4 left-4 w-72 h-56 rounded-3xl shadow-2xl transform rotate-6"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(147, 51, 234, 0.7) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* Card details */}
              <div className="absolute top-6 right-6 text-white/70 text-xs font-mono">
                0.09
              </div>
              
              <div className="absolute top-20 right-6 text-white/50 text-xs font-mono">
                CVV
              </div>
              
              <div className="absolute bottom-12 left-6 text-white/60 text-xs font-mono">
                VALID THRU
              </div>
              
              <div className="absolute bottom-8 left-6 text-white/70 text-sm font-mono">
                05/24
              </div>
              
              {/* Vertical text */}
              <div className="absolute left-6 top-1/2 text-white/60 text-xs font-bold tracking-wider transform -rotate-90 origin-center">
                Glassy
              </div>
            </div>

            {/* Front Card (Light Purple/Pink) */}
            <div
              className="relative w-72 h-56 rounded-3xl shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.4) 0%, rgba(168, 85, 247, 0.6) 50%, rgba(59, 130, 246, 0.4) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              {/* Card chip visual */}
              <div className="absolute top-8 left-6 w-8 h-6 bg-white/20 rounded-md"></div>
              
              {/* Large card number */}
              <div className="absolute top-1/2 left-6 text-white/80 text-base font-mono tracking-widest transform -translate-y-1/2">
                X12 21.39 0823 XXXX
              </div>
              
              {/* Vertical "Glassy" text */}
              <div className="absolute right-8 top-12 text-white/70 text-sm font-bold tracking-wider transform rotate-90 origin-center">
                Glassy
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default GlassyShowcase