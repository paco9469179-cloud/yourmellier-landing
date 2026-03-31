import { useTranslation } from 'react-i18next'

const locales = [
  { code: 'it', label: 'IT' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'es', label: 'ES' },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <nav
      className="flex flex-wrap items-center gap-1 text-xs sm:text-sm"
      aria-label="Language"
    >
      {locales.map(({ code, label }, i) => {
        const active = i18n.language.startsWith(code)
        return (
          <span key={code} className="inline-flex items-center">
            {i > 0 && (
              <span className="mx-1 text-body-muted/60" aria-hidden>
                /
              </span>
            )}
            <button
              type="button"
              onClick={() => void i18n.changeLanguage(code)}
              className={`rounded px-1.5 py-1 font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-page ${
                active ? 'text-wine-900' : 'text-body-muted hover:text-wine-900'
              }`}
              style={active ? { fontWeight: 700 } : { fontWeight: 400 }}
              aria-current={active ? 'true' : undefined}
            >
              {label}
            </button>
          </span>
        )
      })}
    </nav>
  )
}
