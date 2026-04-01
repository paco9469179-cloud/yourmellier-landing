import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'yourmellier-cookie-consent'

export function CookieBanner() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const persist = (value: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-neutral-800 px-4 py-3 text-white shadow-lg sm:px-6"
      role="region"
      aria-label={t('cookies.message')}
    >
      <div className="mx-auto flex max-w-landing flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-white/95">{t('cookies.message')}</p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => persist('rejected')}
            className="rounded-figma border border-white/30 bg-transparent px-4 py-2 text-sm font-medium text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800"
          >
            {t('cookies.reject')}
          </button>
          <button
            type="button"
            onClick={() => persist('accepted')}
            className="rounded-figma bg-white px-4 py-2 text-sm font-medium text-neutral-900 outline-none transition hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800"
          >
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
