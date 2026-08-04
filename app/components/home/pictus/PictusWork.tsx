'use client'
import React, { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

type Project = { title: string; href: string; image: string; position: string }

const ProjectCard = ({ project }: { project: Project }) => (
  <a
    className="work-project-card"
    href={project.href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ '--project-position': project.position } as React.CSSProperties}
  >
    <span className="work-project-media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={project.image} alt={`${project.title} project preview`} loading="lazy" />
    </span>
    <span className="work-project-label">{project.title}</span>
  </a>
)

const slides: { variant: 'a' | 'b'; primary: Project; supporting: [Project, Project] }[] = [
  {
    variant: 'a',
    primary: {
      title: 'bow4bass.com',
      href: 'https://bow4bass.com',
      image: '/projects/bow4bass.webp',
      position: 'left center',
    },
    supporting: [
      {
        title: 'ioana-illustrations.eu',
        href: 'https://ioana-illustrations.eu',
        image: '/projects/ioana-illustrations.webp',
        position: '20% center',
      },
      {
        title: 'miestnacirkev.sk',
        href: 'https://miestnacirkev.sk',
        image: '/projects/miestnacirkev.webp',
        position: '27% center',
      },
    ],
  },
  {
    variant: 'b',
    primary: {
      title: 'prud.sk',
      href: 'https://prud.sk',
      image: '/projects/prud.webp',
      position: 'center top',
    },
    supporting: [
      {
        title: 'kvalitnamontaz.sk',
        href: 'https://kvalitnamontaz.sk',
        image: '/projects/kvalitnamontaz.webp',
        position: 'center top',
      },
      {
        title: 'katolickaviera.sk',
        href: 'https://katolickaviera.sk',
        image: '/projects/katolickaviera.webp',
        position: 'center top',
      },
    ],
  },
  {
    variant: 'a',
    primary: {
      title: 'michaldovala.sk',
      href: 'https://michaldovala.vercel.app',
      image: '/projects/michaldovala.webp',
      position: 'center top',
    },
    supporting: [
      {
        title: 'librosophia.sk',
        href: 'https://librosophia.sk',
        image: '/projects/librosophia.webp',
        position: 'center top',
      },
      {
        title: 'fyziology.sk',
        href: 'https://fyziology.sk',
        image: '/projects/fyziology.webp',
        position: 'center top',
      },
    ],
  },
]

const PictusWork = () => {
  const t = useTranslations('Landing')
  const [active, setActive] = useState(0)
  const [switching, setSwitching] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const showSlide = (next: number) => {
    if (next === active) return
    setSwitching(active)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setActive(next)
      setSwitching(null)
    }, 180)
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    // Ignore taps and vertical scrolls; require a clear horizontal swipe.
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return
    const next = deltaX < 0 ? active + 1 : active - 1
    if (next < 0 || next >= slides.length) return
    showSlide(next)
  }

  return (
    <section className="section-shell" id="selected-work" aria-labelledby="work-title">
      <div className="layout-container">
        <header className="section-heading">
          <p className="section-kicker">{t('work.kicker')}</p>
          <h2 id="work-title">{t('work.title')}</h2>
        </header>

        <div className="work-carousel">
          <div
            className="work-slides"
            aria-live="polite"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {slides.map((slide, index) => {
              const isActive = index === active
              const cls = [
                'work-slide',
                isActive ? 'is-active' : '',
                switching === index ? 'is-switching' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <div key={index} className={cls} hidden={!isActive}>
                  <div className={`work-architecture work-architecture-${slide.variant}`}>
                    {slide.variant === 'a' ? (
                      <>
                        <article className="work-primary">
                          <ProjectCard project={slide.primary} />
                        </article>
                        <div className="work-supporting">
                          <ProjectCard project={slide.supporting[0]} />
                          <ProjectCard project={slide.supporting[1]} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="work-supporting">
                          <ProjectCard project={slide.supporting[0]} />
                          <ProjectCard project={slide.supporting[1]} />
                        </div>
                        <article className="work-primary">
                          <ProjectCard project={slide.primary} />
                        </article>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="work-carousel-dots" aria-label="Project slides">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`work-carousel-dot${index === active ? ' is-active' : ''}`}
                type="button"
                aria-label={`Show project slide ${index + 1}`}
                aria-current={index === active}
                onClick={() => showSlide(index)}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PictusWork
