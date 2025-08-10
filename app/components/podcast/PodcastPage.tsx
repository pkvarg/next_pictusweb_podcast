// 'use client'
// import React, { useState, useEffect } from 'react'
// import {
//   Mic,
//   BookOpen,
//   Globe,
//   Users,
//   Play,
//   Filter,
//   ArrowRight,
//   Zap,
//   Headphones,
// } from 'lucide-react'
// import Footer from '@/app/components/Footer'
// import PagesHeader from '@/app/components/PagesHeader'
// import PodcastImage from '@/app/components/podcast/GoToSinglePodcast'
// import NeedPodcast from '@/app/components/NeedPodcast'

// interface Podcast {
//   id: string
//   title: string
//   description: string | null
//   textPrompt: string
//   imagePrompt: string | null
//   audioPath: string
//   imagePath: string | null
//   category: string
//   english: boolean
//   published: boolean
// }

// interface PodcastPageProps {
//   podcasts: Podcast[]
// }

// const PodcastPage = ({ podcasts }: PodcastPageProps) => {
//   const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>(podcasts)
//   const [selectedCategory, setSelectedCategory] = useState('Všetky')
//   const [selectedLanguage, setSelectedLanguage] = useState('Všetky')

//   // Get unique categories from podcasts
//   const categories = ['Všetky', ...Array.from(new Set(podcasts.map((p) => p.category)))]

//   const languages = [
//     { code: 'Všetky', label: 'Všetky jazyky', flag: '🌐' },
//     { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
//     { code: 'en', label: 'Angličtina', flag: '🇬🇧' },
//   ]

//   // Filter podcasts based on selected filters
//   useEffect(() => {
//     let filtered = podcasts

//     if (selectedCategory !== 'Všetky') {
//       filtered = filtered.filter((podcast) => podcast.category === selectedCategory)
//     }

//     if (selectedLanguage !== 'Všetky') {
//       if (selectedLanguage === 'en') {
//         filtered = filtered.filter((podcast) => podcast.english === true)
//       } else if (selectedLanguage === 'sk') {
//         filtered = filtered.filter((podcast) => podcast.english === false)
//       }
//     }

//     setFilteredPodcasts(filtered)
//   }, [selectedCategory, selectedLanguage, podcasts])

//   if (podcasts.length === 0) {
//     return <p>Žiadne podcasty sa nenašli</p>
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
//       <PagesHeader />

//       {/* Hero Section */}
//       <section className="max-w-7xl mx-auto px-6 py-20">
//         <div className="text-center">
//           <div className="flex justify-center mb-6">
//             <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
//               <Mic className="w-10 h-10 text-white" />
//             </div>
//           </div>

//           <h1 className="text-5xl lg:text-6xl font-light mb-6 leading-tight">
//             AI{' '}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
//               Podcast riešenia
//             </span>
//           </h1>

//           <p className="text-3xl text-gray-300 mb-8 max-w-4xl mx-auto font-light">
//             Premeňte svoj blog na interaktívny podcast
//           </p>
//         </div>
//       </section>

//       {/* Service Description Cards */}
//       <section className="max-w-7xl mx-auto px-6 py-6">
//         <div className="grid md:grid-cols-3 gap-8">
//           <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-8 border border-blue-500/30">
//             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
//               <BookOpen className="w-8 h-8 text-white" />
//             </div>
//             <h3 className="text-2xl font-semibold mb-4">📝 Blog + AI</h3>
//             <p className="text-gray-300 leading-relaxed font-normal">
//               Váš blog sa stane podcastom. Nestrácajte čas nahrávaním, AI to urobí za vás podľa Vami
//               zadaného textu.
//             </p>
//           </div>

//           <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl p-8 border border-purple-500/30">
//             <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
//               <Headphones className="w-8 h-8 text-white" />
//             </div>
//             <h3 className="text-2xl font-semibold mb-4">🎙️ Viac hlasov</h3>
//             <p className="text-gray-300 leading-relaxed">
//               Vyberte si z AI hlasov, ktoré zodpovedajú tónu vašej značky. Profesionálne, neformálne
//               alebo autoritatívne.
//             </p>
//           </div>

//           <div className="bg-gradient-to-br from-pink-900/30 to-orange-900/30 rounded-3xl p-8 border border-pink-500/30">
//             <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center mb-6">
//               <Globe className="w-8 h-8 text-white" />
//             </div>
//             <h3 className="text-2xl font-semibold mb-4">🌐 Viac jazykov</h3>
//             <p className="text-gray-300 leading-relaxed">Oslovte globálne publikum bez námahy.</p>
//           </div>
//         </div>
//       </section>

//       {/* Filter Section */}
//       <section className="max-w-7xl mx-auto px-6 py-12">
//         <div className="text-center mb-12">
//           <h2 className="text-4xl font-light mb-6">
//             Preskúmajte naše <span className="text-purple-400">Podcast príklady</span>
//           </h2>
//         </div>

//         <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-12">
//           <div className="grid md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-3">
//                 <Filter className="w-4 h-4 inline mr-2" />
//                 Kategória
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {categories.map((category) => (
//                   <button
//                     key={category}
//                     onClick={() => setSelectedCategory(category)}
//                     className={`px-4 py-2 rounded-full text-sm transition-all ${
//                       selectedCategory === category
//                         ? 'bg-purple-600 text-white'
//                         : 'bg-white/10 text-gray-300 hover:bg-white/20'
//                     }`}
//                   >
//                     {category}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-3">
//                 <Globe className="w-4 h-4 inline mr-2" />
//                 Jazyk
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {languages.map((lang) => (
//                   <button
//                     key={lang.code}
//                     onClick={() => setSelectedLanguage(lang.code)}
//                     className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
//                       selectedLanguage === lang.code
//                         ? 'bg-purple-600 text-white'
//                         : 'bg-white/10 text-gray-300 hover:bg-white/20'
//                     }`}
//                   >
//                     <span>{lang.flag}</span>
//                     {lang.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Podcasts Grid */}
//       <section className="max-w-7xl mx-auto px-6 pb-20">
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {filteredPodcasts.map((podcast) => (
//             <div
//               key={podcast.id}
//               className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all group"
//             >
//               {/* Podcast Image */}
//               <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative">
//                 <PodcastImage
//                   imagePath={podcast.imagePath || '/icons/headphones.svg'}
//                   title={podcast.title}
//                   id={podcast.id}
//                 />

//                 {/* Language indicator */}
//                 <div className="absolute top-4 left-4">
//                   <span className="bg-black/70 px-3 py-1 rounded-full text-xs font-medium">
//                     {podcast.english ? '🇬🇧 Angličtina' : '🇸🇰 Slovenčina'}
//                   </span>
//                 </div>

//                 <div className="absolute top-4 right-4">
//                   <span className="bg-purple-600 px-3 py-1 rounded-full text-xs font-medium">
//                     {podcast.category}
//                   </span>
//                 </div>
//               </div>

//               {/* Podcast Info */}
//               <div className="p-6">
//                 <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
//                   {podcast.title}
//                 </h3>
//                 <p className="text-gray-400 text-sm mb-4 line-clamp-3">
//                   {podcast.description || podcast.textPrompt.substring(0, 100) + '...'}
//                 </p>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-500 capitalize">
//                     Kategória: {podcast.category}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* No Results */}
//         {filteredPodcasts.length === 0 && (
//           <div className="text-center py-16">
//             <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Mic className="w-12 h-12 text-gray-600" />
//             </div>
//             <h3 className="text-xl font-semibold mb-2">Žiadne podcasty sa nenašli</h3>
//             <p className="text-gray-400">Skúste upraviť filtre, aby ste videli viac výsledkov</p>
//           </div>
//         )}
//       </section>

//       {/* Call to Action */}
//       <NeedPodcast />

//       <Footer />
//     </div>
//   )
// }

// export default PodcastPage

'use client'
import React, { useState, useEffect } from 'react'
import {
  Mic,
  BookOpen,
  Globe,
  Users,
  Play,
  Filter,
  ArrowRight,
  Zap,
  Headphones,
} from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      <PagesHeader />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Mic className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-5xl lg:text-6xl font-light mb-6 leading-tight">
            {t('podcastHeroTitle1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {t('podcastHeroTitle2')}
            </span>
          </h1>

          <p className="text-3xl text-gray-300 mb-8 max-w-4xl mx-auto font-light">
            {t('podcastHeroSubtitle')}
          </p>
        </div>
      </section>

      {/* Service Description Cards */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-8 border border-blue-500/30">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">{t('serviceCard1Title')}</h3>
            <p className="text-gray-300 leading-relaxed font-normal">
              {t('serviceCard1Description')}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl p-8 border border-purple-500/30">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">{t('serviceCard2Title')}</h3>
            <p className="text-gray-300 leading-relaxed">{t('serviceCard2Description')}</p>
          </div>

          <div className="bg-gradient-to-br from-pink-900/30 to-orange-900/30 rounded-3xl p-8 border border-pink-500/30">
            <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">{t('serviceCard3Title')}</h3>
            <p className="text-gray-300 leading-relaxed">{t('serviceCard3Description')}</p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light mb-6">
            {t('examplesSectionTitle')}{' '}
            <span className="text-purple-400">{t('examplesSectionTitleHighlight')}</span>
          </h2>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Filter className="w-4 h-4 inline mr-2" />
                {t('filterCategoryLabel')}
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Globe className="w-4 h-4 inline mr-2" />
                {t('filterLanguageLabel')}
              </label>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
                      selectedLanguage === lang.code
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Podcasts Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPodcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all group"
            >
              {/* Podcast Image */}
              <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative">
                <PodcastImage
                  imagePath={podcast.imagePath || '/icons/headphones.svg'}
                  title={podcast.title}
                  id={podcast.id}
                />

                {/* Language indicator */}
                <div className="absolute top-4 left-4">
                  <span className="bg-black/70 px-3 py-1 rounded-full text-xs font-medium">
                    {podcast.english ? t('languageIndicatorEnglish') : t('languageIndicatorSlovak')}
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <span className="bg-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                    {podcast.category}
                  </span>
                </div>
              </div>

              {/* Podcast Info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                  {podcast.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {podcast.description || podcast.textPrompt.substring(0, 100) + '...'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 capitalize">
                    {t('podcastCategoryLabel')} {podcast.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPodcasts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('noResultsTitle')}</h3>
            <p className="text-gray-400">{t('noResultsDescription')}</p>
          </div>
        )}
      </section>

      {/* Call to Action */}
      <NeedPodcast />

      <Footer />
    </div>
  )
}

export default PodcastPage
