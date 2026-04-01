import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { QuestionnaireTopBar } from '../components/landing/QuestionnaireTopBar'
import { CookieBanner } from '../components/common/CookieBanner'
import { Layout } from '../components/layout/Layout'

const SurveyForm = lazy(() =>
  import('../components/landing/SurveyForm').then((m) => ({ default: m.SurveyForm })),
)

function SurveyFallback() {
  return (
    <div className="py-16 text-center text-sm text-body-muted" aria-busy="true">
      …
    </div>
  )
}

const PAGE_TITLE_ID = 'survey-page-title'

export function Questionnaire() {
  const { t } = useTranslation()

  return (
    <Layout>
      <QuestionnaireTopBar />

      <main className="flex-1">
        <div className="mx-auto max-w-content px-4 pb-16 pt-6 sm:pt-8">
          <h1
            id={PAGE_TITLE_ID}
            className="font-serif text-2xl font-normal leading-tight text-wine-900 sm:text-3xl md:text-fig-h2 md:leading-9"
          >
            <span className="mr-2" aria-hidden>
              📋
            </span>
            {t('surveyPage.pageTitle')}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-body sm:text-lg">
            {t('surveyPage.intro')}
          </p>

          <div className="mt-6">
            <Suspense fallback={<SurveyFallback />}>
              <SurveyForm pageTitleId={PAGE_TITLE_ID} />
            </Suspense>
          </div>
        </div>
      </main>

      <CookieBanner />
    </Layout>
  )
}
