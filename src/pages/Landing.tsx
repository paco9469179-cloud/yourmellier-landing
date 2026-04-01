import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AppPreview } from '../components/landing/AppPreview'
import { BetaHeader } from '../components/landing/BetaHeader'
import { CookieBanner } from '../components/common/CookieBanner'
import { QuickSuggestionForm } from '../components/landing/QuickSuggestionForm'
import { Layout } from '../components/layout/Layout'

const APP_URL = 'https://app-placeholder.com'

export function Landing() {
  const { t } = useTranslation()

  return (
    <Layout>
      <BetaHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-landing px-4 pb-4 pt-6 sm:px-6 sm:pt-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-10 xl:gap-14">
            <div className="flex flex-1 flex-col items-center lg:items-start">
              <AppPreview />
            </div>

            <div className="flex flex-1 flex-col justify-center gap-6 lg:min-w-0 lg:max-w-xl lg:py-4">
              <div>
                <p className="font-serif text-[1.95rem] font-normal leading-tight text-wine-900 sm:text-[2.4375rem]">
                  {t('landing.betaTitle')}
                </p>
                <h1 className="mt-3 font-serif text-2xl font-normal text-wine-900 sm:text-[1.8rem]">
                  {t('landing.welcome')}
                </h1>
                <div className="mt-4 space-y-3 text-base leading-relaxed text-body sm:text-lg">
                  <p>{t('landing.bodyP1')}</p>
                  <p>{t('landing.bodyP2')}</p>
                  <p>{t('landing.bodyP3')}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:max-w-md">
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-figma bg-wine-900 px-8 py-3 text-center text-base font-normal text-white shadow-card outline-none transition hover:bg-wine-800 focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
                >
                  {t('cta.open_app')}
                </a>
                <p className="text-center text-sm leading-relaxed text-body sm:text-left sm:text-base">
                  {t('landing.surveyHint')}
                </p>
                <Link
                  to="/beta/questionnaire"
                  className="inline-flex min-h-11 items-center justify-center rounded-figma border-2 border-wine-900 bg-transparent px-8 py-3 text-center text-base font-normal text-wine-900 outline-none transition hover:bg-wine-900/5 focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
                >
                  <span className="whitespace-pre-line text-center leading-snug">{t('cta.survey')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <QuickSuggestionForm />
      </main>

      <CookieBanner />
    </Layout>
  )
}
