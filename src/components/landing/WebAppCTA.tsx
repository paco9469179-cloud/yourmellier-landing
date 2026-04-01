import { useTranslation } from 'react-i18next'

import { APP_WEB_URL } from '../../config/app'

export function WebAppCTA() {
  const { t } = useTranslation()

  return (
    <section className="border-b border-cream-muted bg-cream px-4 py-10 md:py-12" aria-label={t('cta.open_app')}>
      <div className="mx-auto max-w-landing flex flex-col items-center gap-4 text-center">
        <a
          href={APP_WEB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 min-w-[12rem] items-center justify-center rounded-figma bg-wine-900 px-8 py-3 text-base font-medium text-white shadow-card outline-none transition hover:bg-wine-800 focus-visible:ring-2 focus-visible:ring-wine-700 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          {t('cta.open_app')}
        </a>
      </div>
    </section>
  )
}
