import { useTranslation } from 'react-i18next'
import type { QuestionnaireProgress } from '../../../lib/questionnaireProgress'

type QuestionnaireProgressBarProps = {
  progress: QuestionnaireProgress
}

export function QuestionnaireProgressBar({ progress }: QuestionnaireProgressBarProps) {
  const { t } = useTranslation()
  const { percent, answered, total } = progress

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-wine-900" id="survey-progress-label">
          {t('surveyPage.progressLabel')}
        </span>
        <span className="tabular-nums text-body-muted" aria-live="polite">
          {percent}%
        </span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-fig-border/50"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-labelledby="survey-progress-label"
        aria-valuetext={t('surveyPage.progressAria', { answered, total, percent })}
      >
        <div
          className="h-full rounded-full bg-wine-900 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
