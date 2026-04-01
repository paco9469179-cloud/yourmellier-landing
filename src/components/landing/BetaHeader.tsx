import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { setBetaAuthenticated } from '../../lib/betaAuth'

const LOCALE_FLAGS: Record<string, string> = {
  it: '🇮🇹',
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
}

export function BetaHeader() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language.split('-')[0] ?? 'it'
  const flag = LOCALE_FLAGS[lang] ?? '🌐'

  function logout() {
    setBetaAuthenticated(false)
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-fig-border/60 bg-page/95 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-landing items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-lg leading-none" aria-hidden>
            {flag}
          </span>
          <span className="text-sm font-medium text-wine-900">{t('layout.languageSwitcher')}</span>
          <LanguageSwitcher />
        </div>
        <button
          type="button"
          onClick={logout}
          className="shrink-0 rounded-figma border border-fig-border bg-surface px-3 py-1.5 text-sm font-medium text-wine-900 outline-none transition hover:border-wine-900/40 hover:bg-page focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
        >
          {t('layout.logout')}
        </button>
      </div>
    </header>
  )
}
