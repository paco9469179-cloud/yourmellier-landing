import { useTranslation } from 'react-i18next'

const APP_URL = 'https://app-placeholder.com'

function PlayIcon() {
  return (
    <span
      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15"
      aria-hidden
    >
      <svg className="size-3 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  )
}

export function Hero() {
  const { t } = useTranslation()

  return (
    <section
      className="px-6 pb-12 pt-16 sm:pb-20 sm:pt-24"
      aria-labelledby="hero-title"
      data-node-id="636:538"
    >
      <div className="mx-auto flex max-w-hero flex-col items-center gap-8 text-center">
        <h1
          id="hero-title"
          className="font-serif text-4xl font-normal tracking-[-0.04em] text-wine-900 sm:text-5xl md:text-[3.75rem] md:leading-none"
        >
          {t('hero.title')}
        </h1>

        <div className="flex w-full max-w-2xl flex-col gap-4 text-left text-lg leading-[1.625] text-body sm:text-center">
          <p>{t('hero.p1')}</p>
          <p>{t('hero.p2')}</p>
          <p className="text-center">{t('hero.p3')}</p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
          <a
            href="#video"
            className="inline-flex items-center gap-3 rounded-figma bg-wine-900 px-8 py-3 text-base font-normal text-white shadow-card outline-none transition hover:bg-wine-800 focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
            data-node-id="636:549"
          >
            <PlayIcon />
            {t('hero.watch_video')}
          </a>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm font-medium text-wine-900 underline-offset-4 hover:underline sm:hidden"
          >
            {t('cta.open_app')}
          </a>
        </div>
      </div>
    </section>
  )
}
