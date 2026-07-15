'use client'
import React, { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

type Testimonial = { quote: string; name: string; role: string }

const PictusTestimonials = () => {
  const t = useTranslations('Landing')
  const items = t.raw('testimonials.items') as Testimonial[]
  const [active, setActive] = useState(0)
  const [switching, setSwitching] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showSlide = (next: number) => {
    if (next === active) return
    setSwitching(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setActive(next)
      setSwitching(false)
    }, 180)
  }

  return (
    <section className="section-shell" id="testimonials" aria-labelledby="testimonial-title">
      <div className="layout-container testimonial-carousel">
        <header className="section-heading">
          <h2 id="testimonial-title">{t('testimonials.title')}</h2>
        </header>

        <div className="testimonial-slides" aria-live="polite">
          {items.map((item, index) => {
            const isActive = index === active
            return (
              <div
                key={item.name}
                className={`testimonial-card${isActive ? ' is-active' : ''}${
                  isActive && switching ? ' is-switching' : ''
                }`}
                hidden={!isActive}
              >
                <figure className="testimonial-quote">
                  <blockquote>{`“${item.quote}”`}</blockquote>
                  <figcaption>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </figcaption>
                </figure>
              </div>
            )
          })}
        </div>

        <div className="testimonial-dots" aria-label={t('testimonials.title')}>
          {items.map((item, index) => (
            <button
              key={item.name}
              className={`testimonial-dot${index === active ? ' is-active' : ''}`}
              type="button"
              aria-label={`Show testimonial ${index + 1}`}
              aria-current={index === active}
              onClick={() => showSlide(index)}
            ></button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PictusTestimonials
