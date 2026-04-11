'use client'
import React, { useState, useEffect } from 'react'
import {
  Mic,
  BookOpen,
  Globe,
  Filter,
  Headphones,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motion'
import Footer from '@/app/components/Footer'
import PagesHeader from '@/app/components/PagesHeader'
import PodcastImage from '@/app/components/podcast/GoToSinglePodcast'
import NeedPodcast from '@/app/components/NeedPodcast'
import { useTranslations } from 'next-intl'

interface Podcast {
  id: string
  title: string
  description: string | null
  textPrompt: string
  imagePrompt: string | null
  audioPath: string
  imagePath: string | null
  category: string
  english: boolean
  published: boolean
}

interface PodcastPageProps {
  podcasts: Podcast[]
}

const glassCard = {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(230,230,230,0.02) 100%), rgba(23, 24, 22, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '24px',
}

const PodcastPage = ({ podcasts }: PodcastPageProps) => {
  const t = useTranslations('Podcasts')
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>(podcasts)
  const [selectedCategory, setSelectedCategory] = useState(t('filterAllCategories'))
  const [selectedLanguage, setSelectedLanguage] = useState(t('filterAllLanguages'))

  // Get unique categories from podcasts
  const categories = [
    t('filterAllCategories'),
    ...Array.from(new Set(podcasts.map((p) => p.category))),
  ]

  const languages = [
    { code: t('filterAllLanguages'), label: t('filterAllLanguages'), flag: '🌐' },
    { code: 'sk', label: t('filterSlovak'), flag: '🇸🇰' },
    { code: 'en', label: t('filterEnglish'), flag: '🇬🇧' },
  ]

  // Filter podcasts based on selected filters
  useEffect(() => {
    let filtered = podcasts

    if (selectedCategory !== t('filterAllCategories')) {
      filtered = filtered.filter((podcast) => podcast.category === selectedCategory)
    }

    if (selectedLanguage !== t('filterAllLanguages')) {
      if (selectedLanguage === 'en') {
        filtered = filtered.filter((podcast) => podcast.english === true)
      } else if (selectedLanguage === 'sk') {
        filtered = filtered.filter((podcast) => podcast.english === false)
      }
    }

    setFilteredPodcasts(filtered)
  }, [selectedCategory, selectedLanguage, podcasts, t])

  if (podcasts.length === 0) {
    return <p>{t('noPodcastsFound')}</p>
  }

  return (
    <div className="min-h-screen bg-[#161616] text-white relative">
      {/* Starfield */}
      <div className="fixed inset-0 z-0 pointer-events-none stars-small" />
      <div className="fixed inset-0 z-0 pointer-events-none stars-medium" />
      <div className="fixed inset-0 z-0 pointer-events-none stars-large" />

      <div className="relative z-10">
        <PagesHeader />

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-20">
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            <motion.div
              variants={fadeIn('up', 'tween', 0.1, 0.6)}
              className="flex justify-center mb-8"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(182,224,54,0.2) 0%, rgba(182,224,54,0.05) 100%)',
                  border: '1px solid rgba(182,224,54,0.3)',
                }}
              >
                <Mic className="w-9 h-9 text-pictus-lime" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeIn('up', 'tween', 0.2, 0.6)}
              className="font-brutal-milk text-5xl lg:text-7xl mb-6 leading-tight"
            >
              {t('podcastHeroTitle1')}{' '}
              <span className="text-pictus-lime">
                {t('podcastHeroTitle2')}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn('up', 'tween', 0.3, 0.6)}
              className="text-xl md:text-2xl text-[#F8F8F8]/60 mb-8 max-w-3xl mx-auto font-light"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              {t('podcastHeroSubtitle')}
            </motion.p>
          </motion.div>
        </section>

        {/* Service Description Cards */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <motion.div
            variants={staggerContainer(0.12, 0.15)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              {
                icon: <BookOpen className="w-7 h-7 text-pictus-lime" />,
                title: t('serviceCard1Title'),
                desc: t('serviceCard1Description'),
              },
              {
                icon: <Headphones className="w-7 h-7 text-pictus-lime" />,
                title: t('serviceCard2Title'),
                desc: t('serviceCard2Description'),
              },
              {
                icon: <Globe className="w-7 h-7 text-pictus-lime" />,
                title: t('serviceCard3Title'),
                desc: t('serviceCard3Description'),
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                variants={fadeIn('up', 'tween', i * 0.08, 0.55)}
                style={glassCard}
                className="p-8 md:p-10 group hover:border-pictus-lime/20 transition-all duration-500"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(182,224,54,0.15) 0%, rgba(182,224,54,0.03) 100%)',
                    border: '1px solid rgba(182,224,54,0.15)',
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  className="text-xl md:text-2xl text-white mb-4"
                  style={{ fontFamily: '"Brutal Milk", sans-serif', fontWeight: 500, letterSpacing: '0.5px' }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-[#F8F8F8]/60 text-[15px] md:text-base font-light leading-relaxed"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Filter Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            variants={fadeIn('up', 'tween', 0.1, 0.5)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="font-brutal-milk text-3xl md:text-5xl mb-4">
              {t('examplesSectionTitle')}{' '}
              <span className="text-pictus-lime">{t('examplesSectionTitleHighlight')}</span>
            </h2>
          </motion.div>

          <motion.div
            variants={fadeIn('up', 'tween', 0.2, 0.5)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            style={{
              ...glassCard,
              borderRadius: '20px',
            }}
            className="p-6 md:p-8 mb-12"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-medium text-[#F8F8F8]/50 mb-3 tracking-wider uppercase"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  {t('filterCategoryLabel')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${
                        selectedCategory === category
                          ? 'bg-pictus-lime text-pictus-black font-medium shadow-lg shadow-pictus-lime/20'
                          : 'bg-white/5 text-[#F8F8F8]/60 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#F8F8F8]/50 mb-3 tracking-wider uppercase"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  {t('filterLanguageLabel')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`px-5 py-2 rounded-full text-sm transition-all duration-300 flex items-center gap-2 ${
                        selectedLanguage === lang.code
                          ? 'bg-pictus-lime text-pictus-black font-medium shadow-lg shadow-pictus-lime/20'
                          : 'bg-white/5 text-[#F8F8F8]/60 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                    >
                      <span>{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Podcasts Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <motion.div
            variants={staggerContainer(0.08, 0.15)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPodcasts.map((podcast, index) => (
              <motion.div
                key={podcast.id}
                variants={fadeIn('up', 'tween', index * 0.06, 0.5)}
                style={glassCard}
                className="overflow-hidden group hover:border-pictus-lime/15 transition-all duration-500"
              >
                {/* Podcast Image */}
                <div className="aspect-video relative overflow-hidden">
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(182,224,54,0.08) 0%, rgba(23,24,22,0.5) 100%)',
                    }}
                  />
                  <PodcastImage
                    imagePath={podcast.imagePath || '/icons/headphones.svg'}
                    title={podcast.title}
                    id={podcast.id}
                  />

                  {/* Language indicator */}
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md"
                      style={{
                        background: 'rgba(20, 21, 17, 0.7)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {podcast.english ? t('languageIndicatorEnglish') : t('languageIndicatorSlovak')}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-pictus-lime/90 text-pictus-black px-3 py-1.5 rounded-full text-xs font-semibold">
                      {podcast.category}
                    </span>
                  </div>
                </div>

                {/* Podcast Info */}
                <div className="p-6">
                  <h3
                    className="text-lg font-medium mb-2 group-hover:text-pictus-lime transition-colors duration-300"
                    style={{ fontFamily: '"Brutal Milk", sans-serif', fontWeight: 500 }}
                  >
                    {podcast.title}
                  </h3>
                  <p
                    className="text-[#F8F8F8]/40 text-sm mb-4 line-clamp-3 font-light leading-relaxed"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    {podcast.description || podcast.textPrompt.substring(0, 100) + '...'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs text-[#F8F8F8]/30 capitalize tracking-wider uppercase"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                    >
                      {t('podcastCategoryLabel')} {podcast.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* No Results */}
          {filteredPodcasts.length === 0 && (
            <div className="text-center py-20">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Mic className="w-10 h-10 text-[#F8F8F8]/20" />
              </div>
              <h3 className="font-brutal-milk text-xl mb-2">{t('noResultsTitle')}</h3>
              <p className="text-[#F8F8F8]/40 font-light">{t('noResultsDescription')}</p>
            </div>
          )}
        </section>

        {/* Call to Action */}
        <NeedPodcast />

        <Footer />
      </div>
    </div>
  )
}

export default PodcastPage
