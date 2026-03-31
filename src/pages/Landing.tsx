import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { AppPreview } from '../components/landing/AppPreview'
import { CookieBanner } from '../components/common/CookieBanner'
import { Hero } from '../components/landing/Hero'
import { LanguageSwitcher } from '../components/common/LanguageSwitcher'
import { Layout } from '../components/layout/Layout'

const VideoSection = lazy(() =>
  import('../components/landing/VideoSection').then((m) => ({ default: m.VideoSection })),
)
const BetaFormsColumn = lazy(() =>
  import('../components/landing/BetaFormsColumn').then((m) => ({ default: m.BetaFormsColumn })),
)

const APP_URL = 'https://app-placeholder.com'

function LazyBlock() {
  return (
    <div
      className="border-b border-fig-border bg-page px-4 py-16 text-center text-sm text-body-muted"
      aria-busy="true"
    >
      …
    </div>
  )
}

export function Landing() {
  const { t } = useTranslation()

  return (
    <Layout>
      <header className="sticky top-0 z-20 border-b border-fig-border/60 bg-page/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-landing items-center justify-between gap-4">
          <span className="font-serif text-lg font-semibold tracking-tight text-wine-900 md:text-xl">
            {t('layout.brand')}
          </span>
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-5">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-sm font-medium text-wine-900 underline-offset-4 hover:underline sm:inline"
            >
              {t('cta.open_app')}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />

        <div className="mx-auto max-w-landing px-6 pb-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <AppPreview />
            <Suspense fallback={<LazyBlock />}>
              <BetaFormsColumn />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<LazyBlock />}>
          <VideoSection />
        </Suspense>
      </main>

      <CookieBanner />
    </Layout>
  )
}
