'use client'
import React from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import PictusPagesHeader from '@/app/components/home/pictus/PictusPagesHeader'
import PictusFooter from '@/app/components/home/pictus/PictusFooter'
import { useTranslations } from 'next-intl'

const projects = [
  {
    title: 'bow4bass.com',
    image: '/projects/bow4bass.webp',
    href: 'https://bow4bass.com',
    objectPosition: 'left center',
    descriptionKey: 'projectBow4bassDesc',
  },
  {
    title: 'ioana-illustrations.eu',
    image: '/projects/ioana-illustrations.webp',
    href: 'https://ioana-illustrations.eu',
    objectPosition: '20% center',
    descriptionKey: 'projectIoanaDesc',
  },
  {
    title: 'miestnacirkev.sk',
    image: '/projects/miestnacirkev.webp',
    href: 'https://miestnacirkev.sk',
    objectPosition: '27% center',
    descriptionKey: 'projectMiestnacirkevDesc',
  },
  {
    title: 'kvalitnamontaz.sk',
    image: '/projects/kvalitnamontaz.webp',
    href: 'https://kvalitnamontaz.sk',
    descriptionKey: 'projectKvalitnamontazDesc',
  },
  {
    title: 'katolickaviera.sk',
    image: '/projects/katolickaviera.webp',
    href: 'https://katolickaviera.sk',
    descriptionKey: 'projectKatolickavieraDesc',
  },
  {
    title: 'prud.sk',
    image: '/projects/prud.webp',
    href: 'https://prud.sk',
    descriptionKey: 'projectPrudDesc',
  },
  {
    title: 'michaldovala.sk',
    image: '/projects/michaldovala.webp',
    href: 'https://michaldovala.vercel.app',
    descriptionKey: 'projectMichaldovalaDesc',
  },
  {
    title: 'librosophia.sk',
    image: '/projects/librosophia.webp',
    href: 'https://librosophia.sk',
    descriptionKey: 'projectLibrosophiaDesc',
  },
  {
    title: 'fyziology.sk',
    image: '/projects/fyziology.webp',
    href: 'https://fyziology.sk',
    descriptionKey: 'projectFyziologyDesc',
  },
]

const ProjectsPage = () => {
  const t = useTranslations('Home')
  const tl = useTranslations('Landing')
  const { locale } = useParams()

  return (
    <div className="pl" data-locale={locale as string}>
      <PictusPagesHeader />

      <main id="main">
        <section className="section-shell" aria-labelledby="projects-title">
          <div className="layout-container">
            <header className="section-heading fs-heading">
              <p className="section-kicker">{tl('work.kicker')}</p>
              <h2 id="projects-title">{t('ourProjectsTitle')}</h2>
              <p>{t('projectsSubtitle')}</p>
            </header>

            <div className="projects-list">
              {projects.map((project, index) => (
                <article
                  className={`project-row${index % 2 === 1 ? ' is-reversed' : ''}`}
                  key={project.title}
                >
                  <a
                    className="project-media"
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={project.title}
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={1200}
                      height={750}
                      style={{ objectPosition: project.objectPosition || 'center top' }}
                      sizes="(max-width: 860px) 100vw, 55vw"
                    />
                  </a>

                  <div className="project-copy">
                    <a
                      className="project-title-link"
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <h3>{project.title}</h3>
                      <ExternalLink aria-hidden="true" />
                    </a>
                    <p>{t(project.descriptionKey)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell section-muted" aria-labelledby="projects-cta-title">
          <div className="layout-container">
            <header className="section-heading fs-heading" style={{ marginBottom: 0 }}>
              <h2 id="projects-cta-title">{t('callToActionTitle')}</h2>
              <div className="fs-cta-actions">
                <Link className="button button-primary" href="/contact">
                  {t('getInTouchButton')} <span aria-hidden="true">→</span>
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

export default ProjectsPage
