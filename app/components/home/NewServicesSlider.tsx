// 'use client'
// import React, { useState, useEffect } from 'react'
// import { ChevronLeft, ChevronRight, Car, Mic, Sparkles, ArrowRight } from 'lucide-react'

// import { Link } from '@/i18n/routing'

// const NewServicesSlider = () => {
//   const [currentSlide, setCurrentSlide] = useState(0)
//   const [isAutoPlaying, setIsAutoPlaying] = useState(true)

//   const services = [
//     {
//       id: 1,
//       title: 'Notifikácie pre Vaše vozidlá',
//       subtitle: 'Inteligentné upozornenia pre firemné vozidlá',
//       description:
//         'Eliminujte pokuty za zmeškanú TK a ušetrite čas s automatickými upozorneniami na technické kontroly, výmeny pneumatík a servisné prehliadky.',
//       features: [
//         'Technické kontroly',
//         'Výmeny pneumatík',
//         'Servisné prehliadky',
//         'Poistné termíny',
//       ],
//       price: 'Od €12/mesiac',
//       icon: Car,
//       link: '/automatizations/vehicles',
//       gradient: 'from-blue-600 to-purple-600',
//       bgGradient: 'from-blue-900/20 to-purple-900/20',
//       href: '/vozidla-notifikacie',
//       badge: 'NOVÉ',
//     },
//     {
//       id: 2,
//       title: 'AI Podcasty',
//       subtitle: 'Tvorba podcastov pomocou AI',
//       description: 'Vytvárame weby s AI službami pre Vaše blogy. Premeňte svoj blog na podcast!',
//       features: ['AI hlasy', 'Admin panel', 'Klasický blog + AI podcast', 'Multi-jazyčnosť'],
//       price: '',
//       icon: Mic,
//       gradient: 'from-pink-600 to-orange-600',
//       bgGradient: 'from-pink-900/20 to-orange-900/20',
//       link: '/podcast',
//       badge: 'NOVÉ',
//     },
//   ]

//   // Auto-slide functionality
//   useEffect(() => {
//     if (!isAutoPlaying) return

//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % services.length)
//     }, 5000)

//     return () => clearInterval(interval)
//   }, [isAutoPlaying, services.length])

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % services.length)
//     setIsAutoPlaying(false)
//   }

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + services.length) % services.length)
//     setIsAutoPlaying(false)
//   }

//   const goToSlide = (index: number) => {
//     setCurrentSlide(index)
//     setIsAutoPlaying(false)
//   }

//   return (
//     <section className="py-20 relative overflow-hidden">
//       <div className="max-w-7xl mx-auto px-6 relative">
//         {/* Header */}
//         <div className="text-center mb-16">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <Sparkles className="w-6 h-6 text-purple-400" />
//             <span className="text-purple-400 font-medium uppercase tracking-wider text-sm">
//               Nové služby
//             </span>
//           </div>
//           <h2 className="text-4xl lg:text-5xl font-light mb-6 text-white">
//             Najnovšie{' '}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
//               AI riešenia
//             </span>
//           </h2>
//         </div>

//         {/* Slider Container */}
//         <div className="relative">
//           <div className="overflow-hidden rounded-3xl">
//             <div
//               className="flex transition-transform duration-700 ease-in-out"
//               style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//             >
//               {services.map((service) => {
//                 const IconComponent = service.icon
//                 return (
//                   <div key={service.id} className="w-full flex-shrink-0">
//                     <div
//                       className={`relative bg-gradient-to-br ${service.bgGradient} backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-12 mx-2`}
//                     >
//                       {/* Badge */}
//                       <div className="absolute top-6 right-6">
//                         <span
//                           className={`bg-gradient-to-r ${service.gradient} px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider`}
//                         >
//                           {service.badge}
//                         </span>
//                       </div>

//                       <div className="flex flex-col justify-center items-center">
//                         {/* Content */}
//                         <div>
//                           <div className="flex items-center gap-4 mb-6">
//                             <div
//                               className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center`}
//                             >
//                               <IconComponent className="w-8 h-8 text-white" />
//                             </div>
//                             <div>
//                               <h3 className="text-3xl font-bold text-white mb-1">
//                                 {service.title}
//                               </h3>
//                               <p className="text-gray-300 text-xl font-thin">{service.subtitle}</p>
//                             </div>
//                           </div>

//                           <p className="text-white text-xl leading-relaxed mb-8 font-thin">
//                             {service.description}
//                           </p>

//                           {/* Features */}
//                           <div className="grid grid-cols-2 justify-center gap-2 mb-8">
//                             {service.features.map((feature, index) => (
//                               <div key={index} className="flex items-center gap-2">
//                                 <div
//                                   className={`w-2 h-2 bg-gradient-to-r ${service.gradient} rounded-full`}
//                                 />
//                                 <span className="text-white text-[20px] font-thin">{feature}</span>
//                               </div>
//                             ))}
//                           </div>

//                           {/* Price & CTA */}
//                           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
//                             <div className="text-2xl font-thin text-white">{service.price}</div>
//                             <Link
//                               href={service.link}
//                               className={`bg-gradient-to-r ${service.gradient} px-6 py-3 rounded-full text-white font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 group`}
//                             >
//                               Zistiť viac
//                               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                             </Link>
//                           </div>
//                         </div>

//                         {/* Visual/Mockup */}
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>

//           {/* Navigation Arrows */}
//           <button
//             onClick={prevSlide}
//             className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10"
//           >
//             <ChevronLeft className="w-6 h-6" />
//           </button>
//           <button
//             onClick={nextSlide}
//             className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10"
//           >
//             <ChevronRight className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Dots Navigation */}
//         <div className="flex justify-center gap-3 mt-8">
//           {services.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => goToSlide(index)}
//               className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                 currentSlide === index
//                   ? 'bg-gradient-to-r from-purple-400 to-pink-400'
//                   : 'bg-white/30 hover:bg-white/50'
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

// export default NewServicesSlider

'use client'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Car, Mic, Sparkles, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

const NewServicesSlider = () => {
  const t = useTranslations('NewsSlider')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const services = [
    {
      id: 1,
      title: t('service1Title'),
      subtitle: t('service1Subtitle'),
      description: t('service1Description'),
      features: [
        t('service1Feature1'),
        t('service1Feature2'),
        t('service1Feature3'),
        t('service1Feature4'),
      ],
      price: t('service1Price'),
      icon: Car,
      link: '/automatizations/vehicles',
      gradient: 'from-blue-600 to-purple-600',
      bgGradient: 'from-blue-900/20 to-purple-900/20',
      href: '/vozidla-notifikacie',
      badge: t('service1Badge'),
    },
    {
      id: 2,
      title: t('service2Title'),
      subtitle: t('service2Subtitle'),
      description: t('service2Description'),
      features: [
        t('service2Feature1'),
        t('service2Feature2'),
        t('service2Feature3'),
        t('service2Feature4'),
      ],
      price: t('service2Price'),
      icon: Mic,
      gradient: 'from-pink-600 to-orange-600',
      bgGradient: 'from-pink-900/20 to-orange-900/20',
      link: '/podcast',
      badge: t('service2Badge'),
    },
  ]

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % services.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, services.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % services.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-purple-400 font-medium uppercase tracking-wider text-sm">
              {t('newServicesLabel')}
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-light mb-6 text-white">
            {t('latestTitle')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {t('latestTitleHighlight')}
            </span>
          </h2>
        </div>

        {/* Slider Container - Mobile: Stack vertically, Desktop: Horizontal slider */}
        <div className="relative">
          {/* Mobile: Vertical Stack */}
          <div className="lg:hidden space-y-6">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <div key={service.id} className="w-full">
                  <div
                    className={`relative bg-gradient-to-br ${service.bgGradient} backdrop-blur-sm border border-white/10 rounded-3xl p-6`}
                  >
                    <div className="flex flex-col justify-center items-center">
                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div
                            className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center`}
                          >
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">
                              {service.title}
                            </h3>
                            <p className="text-gray-300 text-lg font-thin">{service.subtitle}</p>
                          </div>
                        </div>

                        <p className="text-white text-lg leading-relaxed mb-6 font-thin">
                          {service.description}
                        </p>

                        {/* Features */}
                        <div className="grid grid-cols-1 gap-2 mb-6">
                          {service.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 bg-gradient-to-r ${service.gradient} rounded-full`}
                              />
                              <span className="text-white text-base font-thin">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Price & CTA */}
                        <div className="flex flex-col gap-4">
                          <div className="text-xl font-thin text-white">{service.price}</div>
                          <Link
                            href={service.link}
                            className={`bg-gradient-to-r ${service.gradient} px-6 py-3 rounded-full text-white font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 group w-fit`}
                          >
                            {t('learnMore')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop: Horizontal Slider */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {services.map((service) => {
                  const IconComponent = service.icon
                  return (
                    <div key={service.id} className="w-full flex-shrink-0">
                      <div
                        className={`relative bg-gradient-to-br ${service.bgGradient} backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-12 mx-2`}
                      >
                        <div className="flex flex-col justify-center items-center">
                          {/* Content */}
                          <div>
                            <div className="flex items-center gap-4 mb-6">
                              <div
                                className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center`}
                              >
                                <IconComponent className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="text-3xl font-bold text-white mb-1">
                                  {service.title}
                                </h3>
                                <p className="text-gray-300 text-xl font-thin">{service.subtitle}</p>
                              </div>
                            </div>

                            <p className="text-white text-xl leading-relaxed mb-8 font-thin">
                              {service.description}
                            </p>

                            {/* Features */}
                            <div className="grid grid-cols-2 justify-center gap-2 mb-8">
                              {service.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 bg-gradient-to-r ${service.gradient} rounded-full`}
                                  />
                                  <span className="text-white text-[20px] font-thin">{feature}</span>
                                </div>
                              ))}
                            </div>

                            {/* Price & CTA */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <div className="text-2xl font-thin text-white">{service.price}</div>
                              <Link
                                href={service.link}
                                className={`bg-gradient-to-r ${service.gradient} px-6 py-3 rounded-full text-white font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 group`}
                              >
                                {t('learnMore')}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Navigation Arrows - Desktop only */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dots Navigation - Desktop only */}
        <div className="hidden lg:flex justify-center gap-3 mt-8">
          {services.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewServicesSlider
