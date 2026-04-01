import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'

const APP_URL = 'https://app-placeholder.com'

function scrollToPhonePreview(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  document.getElementById('app-preview')?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}

function PlayIcon() {
  return (
    <span
      className="flex size-[0.875rem] shrink-0 items-center justify-center rounded-full bg-white/15 sm:size-4"
      aria-hidden
    >
      <svg className="size-2.5 text-white sm:size-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  )
}

export function Hero() {
  const { t } = useTranslation()

  return (
    <section
      className="px-6 pb-10 pt-4 sm:pb-16 sm:pt-6"
      aria-labelledby="hero-title"
      data-node-id="636:538"
    >
      <div className="mx-auto flex max-w-hero flex-col items-center gap-[1.4rem] text-center sm:gap-8">
        <h1
          id="hero-title"
          className="font-serif font-normal tracking-[-0.04em] text-wine-900 text-[1.575rem] leading-tight sm:text-[2.1rem] md:text-[2.625rem] md:leading-none"
        >
          {t('hero.title')}
        </h1>

        <div className="flex w-full max-w-2xl flex-col gap-[0.7rem] text-left text-[0.788rem] leading-[1.55] text-body sm:text-center sm:text-[0.813rem] md:text-[0.875rem]">
          <p>{t('hero.p1')}</p>
          <p>{t('hero.p2')}</p>
          <p className="text-center">{t('hero.p3')}</p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
          <a
            href="#app-preview"
            onClick={scrollToPhonePreview}
            className="inline-flex items-center gap-2 rounded-figma bg-wine-900 px-6 py-2.5 text-sm font-normal text-white shadow-card outline-none transition hover:bg-wine-800 focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-page sm:gap-3 sm:px-8 sm:py-3 sm:text-base"
            data-node-id="636:549"
          >
            <PlayIcon />
            {t('hero.watch_video')}
          </a>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-xs font-medium text-wine-900 underline-offset-4 hover:underline sm:hidden sm:text-sm"
          >
            {t('cta.open_app')}
          </a>
        </div>
      </div>
    </section>
  )
}
