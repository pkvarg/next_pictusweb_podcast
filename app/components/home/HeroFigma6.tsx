'use client'
import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const HeroFigma6 = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#0a0a1a]">
      {/* Starry Background */}
      <div className="absolute inset-0 stars-background"></div>

      {/* Navigation */}
      <nav className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-4 backdrop-blur-md bg-white/10 rounded-full px-8 py-3 border border-white/20">
          <a href="#" className="text-white/90 hover:text-white transition px-4 py-1">Home</a>
          <a href="#" className="text-white/90 hover:text-white transition px-4 py-1">Features</a>
          <a href="#" className="text-white/90 hover:text-white transition px-4 py-1">Pricing</a>
          <a href="#" className="text-white/90 hover:text-white transition px-4 py-1">Contact</a>
        </div>
      </nav>

      {/* Floating Bubbles */}
      <motion.div
        className="absolute top-[15%] left-[8%] w-24 h-24 z-10"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border-2 border-white/20 shadow-2xl">
          {/* Highlight */}
          <div className="absolute top-2 right-4 w-8 h-8 rounded-full bg-white/60 blur-md"></div>
          <div className="absolute top-1 right-3 w-6 h-6 rounded-full bg-white/80"></div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[12%] right-[25%] w-40 h-40 z-10"
        animate={{
          y: [0, -30, 0],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border-2 border-white/20 shadow-2xl">
          {/* Highlight */}
          <div className="absolute top-4 right-8 w-12 h-12 rounded-full bg-white/60 blur-lg"></div>
          <div className="absolute top-3 right-7 w-10 h-10 rounded-full bg-white/80"></div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[20%] right-[8%] w-16 h-16 z-10"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 10, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border-2 border-white/20 shadow-2xl">
          {/* Highlight */}
          <div className="absolute top-1 right-2 w-6 h-6 rounded-full bg-white/60 blur-sm"></div>
          <div className="absolute top-1 right-2 w-4 h-4 rounded-full bg-white/80"></div>
        </div>
      </motion.div>

      {/* Green Hills Landscape */}
      <div className="absolute bottom-0 left-0 w-full h-[60%] z-5">
        <svg
          viewBox="0 0 1440 800"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="hillGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#c5d9a4', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#9cb87d', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="hillGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#b8cc8f', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#8fa76d', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Back hill */}
          <path
            d="M0,400 Q360,250 720,300 T1440,350 L1440,800 L0,800 Z"
            fill="url(#hillGradient2)"
          />

          {/* Front hill */}
          <path
            d="M0,500 Q360,380 720,420 T1440,480 L1440,800 L0,800 Z"
            fill="url(#hillGradient1)"
          />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex items-end pb-32 px-8 lg:px-20">
        <div className="max-w-7xl mx-auto w-full flex items-end justify-between">
          {/* Left Content */}
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 leading-tight mb-8 drop-shadow-sm">
              Unlocking Creativity.<br />
              Effortless Design.
            </h1>

            <motion.button
              className="group relative backdrop-blur-md bg-white/40 hover:bg-white/50 text-gray-800 font-medium px-8 py-4 rounded-full border border-white/50 transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Journey
              <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
            </motion.button>
          </motion.div>

          {/* Right Content - Character */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Character Placeholder - This would be replaced with actual 3D character */}
            <div className="relative w-64 h-80">
              {/* Green character body */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <motion.div
                  animate={{
                    y: [0, -10, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Head */}
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#b8cc8f] to-[#9cb87d] shadow-2xl mb-2">
                    {/* Simple face */}
                    <div className="flex items-center justify-center h-full gap-4 pt-4">
                      <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                    </div>
                    <div className="w-8 h-2 mx-auto mt-2 rounded-full bg-gray-800 opacity-50"></div>
                  </div>

                  {/* Body */}
                  <div className="w-28 h-32 mx-auto rounded-t-full rounded-b-3xl bg-gradient-to-br from-[#b8cc8f] to-[#8fa76d] shadow-xl">
                    {/* Arms */}
                    <div className="relative">
                      <div className="absolute -left-8 top-4 w-12 h-8 rounded-full bg-gradient-to-br from-[#b8cc8f] to-[#9cb87d] rotate-45"></div>
                      <div className="absolute -right-8 top-4 w-12 h-8 rounded-full bg-gradient-to-br from-[#b8cc8f] to-[#9cb87d] -rotate-45"></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Star */}
      <motion.div
        className="absolute bottom-20 right-20 z-20"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M30 0L33.5 26.5L60 30L33.5 33.5L30 60L26.5 33.5L0 30L26.5 26.5L30 0Z" fill="white" opacity="0.8"/>
        </svg>
      </motion.div>

      {/* Stars CSS - Add to global styles or use styled-jsx */}
      <style jsx>{`
        .stars-background {
          background-image:
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 60px 70px, white, transparent),
            radial-gradient(1px 1px at 50px 50px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, white, transparent),
            radial-gradient(2px 2px at 90px 10px, white, transparent),
            radial-gradient(1px 1px at 150px 120px, white, transparent),
            radial-gradient(1px 1px at 200px 50px, white, transparent),
            radial-gradient(2px 2px at 170px 150px, white, transparent);
          background-size: 200px 200px;
          background-position: 0 0, 40px 60px, 80px 120px, 120px 180px;
          animation: twinkle 8s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  )
}

export default HeroFigma6
