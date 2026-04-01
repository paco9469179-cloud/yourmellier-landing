import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../common/LanguageSwitcher'

export function QuestionnaireTopBar() {
  const { t } = useTranslation()

  return (
    <div className="border-b border-fig-border/60 bg-page/95 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4">
        <Link
          to="/beta"
          className="text-sm font-medium text-wine-900 underline-offset-4 hover:underline"
        >
          ← {t('surveyPage.back')}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <span className="text-sm font-medium text-wine-900">{t('layout.languageSwitcher')}</span>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
