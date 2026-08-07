'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Mic, BookOpen, Globe, Filter, Headphones } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import PictusPagesHeader from '@/app/components/home/pictus/PictusPagesHeader'
import PictusFooter from '@/app/components/home/pictus/PictusFooter'
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
  const th = useTranslations('Home')
  const { locale } = useParams()
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>(podcasts)
  const [selectedCategory, setSelectedCategory] = useState(t('filterAllCategories'))
  const [selectedLanguage, setSelectedLanguage] = useState(t('filterAllLanguages'))

  const categories = [
    t('filterAllCategories'),
    ...Array.from(new Set(podcasts.map((p) => p.category))),
  ]

  const languages = [
    { code: t('filterAllLanguages'), label: t('filterAllLanguages'), flag: '🌐' },
    { code: 'sk', label: t('filterSlovak'), flag: '🇸🇰' },
    { code: 'en', label: t('filterEnglish'), flag: '🇬🇧' },
  ]

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

  const serviceCards = [
    { icon: <BookOpen />, title: t('serviceCard1Title'), desc: t('serviceCard1Description') },
    { icon: <Headphones />, title: t('serviceCard2Title'), desc: t('serviceCard2Description') },
    { icon: <Globe />, title: t('serviceCard3Title'), desc: t('serviceCard3Description') },
  ]

  return (
    <div className="pl" data-locale={locale as string}>
      <PictusPagesHeader />

      <main id="main">
        {/* Hero */}
        <section className="section-shell" aria-labelledby="podcasts-title">
          <div className="layout-container">
            <header className="section-heading fs-heading">
              <p className="section-kicker">{th('navbarPodcasts')}</p>
              <h2 id="podcasts-title">
                {t('podcastHeroTitle1')} <span className="fs-hl">{t('podcastHeroTitle2')}</span>
              </h2>
              <p>{t('podcastHeroSubtitle')}</p>
            </header>

            <div className="feature-grid">
              {serviceCards.map((card) => (
                <div className="feature-card" key={card.title}>
                  <span className="feature-icon">{card.icon}</span>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Examples + filters */}
        <section className="section-shell section-muted" aria-labelledby="podcasts-examples">
          <div className="layout-container">
            <header className="section-heading fs-heading">
              <h2 id="podcasts-examples">
                {t('examplesSectionTitle')}{' '}
                <span className="fs-hl">{t('examplesSectionTitleHighlight')}</span>
              </h2>
            </header>

            <div className="podcast-filters">
              <div>
                <span className="podcast-filter-label">
                  <Filter size={14} /> {t('filterCategoryLabel')}
                </span>
                <div className="podcast-filter-chips">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`filter-chip${selectedCategory === category ? ' is-active' : ''}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="podcast-filter-label">
                  <Globe size={14} /> {t('filterLanguageLabel')}
                </span>
                <div className="podcast-filter-chips">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`filter-chip${selectedLanguage === lang.code ? ' is-active' : ''}`}
                    >
                      <span aria-hidden="true">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredPodcasts.length > 0 ? (
              <div className="podcast-grid">
                {filteredPodcasts.map((podcast) => (
                  <article className="podcast-card" key={podcast.id}>
                    <Link
                      href={`/podcasts/${podcast.id}`}
                      className="podcast-card-link"
                      aria-label={podcast.title}
                    >
                      <div className="podcast-card-media">
                        <span className="podcast-badge podcast-badge-lang">
                          {podcast.english
                            ? t('languageIndicatorEnglish')
                            : t('languageIndicatorSlovak')}
                        </span>
                        <span className="podcast-badge podcast-badge-cat">{podcast.category}</span>
                        <Image
                          src={podcast.imagePath || '/icons/headphones.svg'}
                          alt={podcast.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
                        />
                      </div>
                      <div className="podcast-card-body">
                        <h3>{podcast.title}</h3>
                        <p>{podcast.description || podcast.textPrompt.substring(0, 100) + '...'}</p>
                        <span className="podcast-card-meta">
                          {t('podcastCategoryLabel')} {podcast.category}
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="podcast-empty">
                <span className="feature-icon">
                  <Mic />
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)' }}>{t('noResultsTitle')}</h3>
                <p>{t('noResultsDescription')}</p>
              </div>
            )}
          </div>
        </section>

        <section className="section-shell" aria-labelledby="podcasts-cta">
          <div className="layout-container">
            <header className="section-heading fs-heading" style={{ marginBottom: 0 }}>
              <h2 id="podcasts-cta">{th('podcastNeedPodcast')}</h2>
              <p>{th('podcastNeedPodcastAction')}</p>
              <div className="fs-cta-actions">
                <Link className="button button-primary" href="/contact">
                  {th('getInTouchButton')} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </header>
          </div>
        </section>
      </main>

      <PictusFooter homeBase={`/${locale as string}`} />
    </div>
  )
}

export default PodcastPage
