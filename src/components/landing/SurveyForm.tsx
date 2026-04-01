import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { getFunctionInvokeErrorMessage, getSupabase } from '../../lib/supabase'
import { getOrCreateSurveySessionId } from '../../lib/surveySession'
import { computeQuestionnaireProgress } from '../../lib/questionnaireProgress'
import { stripHtmlTags } from '../../lib/sanitize'
import type { Likert1to5, QuestionnaireV2Answers, QuestionnaireV2Payload } from '../../types/questionnaireV2'
import { Likert5 } from './survey/Likert5'
import { Nps0to10 } from './survey/Nps0to10'
import { QuestionnaireProgressBar } from './survey/QuestionnaireProgressBar'

type V2FormValues = {
  onboarding_scope_clarity: string
  onboarding_ease_without_instructions: string
  onboarding_first_impression: string
  ym_suggestions_relevance: string
  ym_reason_useful: string
  ym_improve_suggestions: string
  ux_navigation_fluidity: string
  ux_least_intuitive: string
  ux_least_intuitive_other: string
  ux_technical_issues: string
  purchase_links_usefulness: string
  purchase_confidence: string
  purchase_clicked_link: string
  value_real_world_usefulness: string
  value_reuse_likelihood: string
  value_nps: string
  modality_web_vs_app: string
  modality_liked_most: string
  modality_liked_least: string
  modality_feature_request: string
}

const defaultV2: V2FormValues = {
  onboarding_scope_clarity: '',
  onboarding_ease_without_instructions: '',
  onboarding_first_impression: '',
  ym_suggestions_relevance: '',
  ym_reason_useful: '',
  ym_improve_suggestions: '',
  ux_navigation_fluidity: '',
  ux_least_intuitive: '',
  ux_least_intuitive_other: '',
  ux_technical_issues: '',
  purchase_links_usefulness: '',
  purchase_confidence: '',
  purchase_clicked_link: '',
  value_real_world_usefulness: '',
  value_reuse_likelihood: '',
  value_nps: '',
  modality_web_vs_app: '',
  modality_liked_most: '',
  modality_liked_least: '',
  modality_feature_request: '',
}

const inputClassBase =
  'w-full rounded-figma border border-fig-border bg-fig-input outline-none transition focus:border-wine-900 focus:ring-2 focus:ring-wine-900/20'

function parseLikert(v: string): Likert1to5 | null {
  const n = Number(v)
  if (n >= 1 && n <= 5 && Number.isInteger(n)) return n as Likert1to5
  return null
}

function parseNps(v: string): number | null {
  const n = Number(v)
  if (n >= 0 && n <= 10 && Number.isInteger(n)) return n
  return null
}

function clampText(s: string, max: number): string {
  const t = stripHtmlTags(s).trim()
  return t.length > max ? t.slice(0, max) : t
}

type SurveyFormProps = {
  embedded?: boolean
  /** id dell’`<h1>` titolo (pagina dedicata, accessibilità). */
  pageTitleId?: string
}

export function SurveyForm({ embedded = false, pageTitleId = 'survey-page-title' }: SurveyFormProps) {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<V2FormValues>({ defaultValues: defaultV2 })

  const uxLeast = useWatch({ control, name: 'ux_least_intuitive' })
  const watchedAll = useWatch({ control })
  const progress = useMemo(() => {
    const merged = {
      ...defaultV2,
      ...(typeof watchedAll === 'object' && watchedAll ? watchedAll : {}),
    }
    return computeQuestionnaireProgress(merged as Record<string, string | undefined>)
  }, [watchedAll])

  const req = t('survey.validation.required')
  const longErr = t('survey.validation.text_long')
  const otherErr = t('survey.validation.other_detail')

  const inputClass = embedded
    ? `${inputClassBase} px-2.5 py-1.5 text-sm leading-tight text-body`
    : `${inputClassBase} px-3 py-2.5 text-base text-body`

  const radioBtn = embedded
    ? 'inline-flex cursor-pointer items-center gap-1.5 rounded-figma border border-fig-border bg-page px-2.5 py-1.5 text-sm text-body transition hover:border-wine-900/40 has-[:checked]:border-wine-900 has-[:checked]:bg-wine-900 has-[:checked]:text-white'
    : 'inline-flex cursor-pointer items-center gap-2 rounded-figma border border-fig-border bg-page px-3 py-2 text-base text-body transition hover:border-wine-900/40 has-[:checked]:border-wine-900 has-[:checked]:bg-wine-900 has-[:checked]:text-white'

  const onSubmit = async (values: V2FormValues) => {
    clearErrors('root')
    const invalidPayload = () =>
      setError('root', { type: 'manual', message: t('survey.validation.invalid_payload') })

    const checkText = (raw: string, field: keyof V2FormValues) => {
      const cleaned = stripHtmlTags(raw)
      if (cleaned.length > 2000) {
        setError(field, { type: 'manual', message: longErr })
        return false
      }
      return true
    }

    if (!checkText(values.onboarding_first_impression, 'onboarding_first_impression')) return
    if (!checkText(values.ym_improve_suggestions, 'ym_improve_suggestions')) return
    if (!checkText(values.ux_technical_issues, 'ux_technical_issues')) return
    if (!checkText(values.modality_liked_most, 'modality_liked_most')) return
    if (!checkText(values.modality_liked_least, 'modality_liked_least')) return
    if (!checkText(values.modality_feature_request, 'modality_feature_request')) return

    if (values.ux_least_intuitive === 'other') {
      const o = stripHtmlTags(values.ux_least_intuitive_other).trim()
      if (!o) {
        setError('ux_least_intuitive_other', { type: 'manual', message: otherErr })
        return
      }
      if (o.length > 2000) {
        setError('ux_least_intuitive_other', { type: 'manual', message: longErr })
        return
      }
    }

    const onboarding_scope_clarity = parseLikert(values.onboarding_scope_clarity)
    const onboarding_ease_without_instructions = parseLikert(values.onboarding_ease_without_instructions)
    const ym_suggestions_relevance = parseLikert(values.ym_suggestions_relevance)
    const ux_navigation_fluidity = parseLikert(values.ux_navigation_fluidity)
    const purchase_links_usefulness = parseLikert(values.purchase_links_usefulness)
    const value_real_world_usefulness = parseLikert(values.value_real_world_usefulness)
    const value_reuse_likelihood = parseLikert(values.value_reuse_likelihood)

    if (
      !onboarding_scope_clarity ||
      !onboarding_ease_without_instructions ||
      !ym_suggestions_relevance ||
      !ux_navigation_fluidity ||
      !purchase_links_usefulness ||
      !value_real_world_usefulness ||
      !value_reuse_likelihood
    ) {
      invalidPayload()
      return
    }

    const ym_reason_useful = values.ym_reason_useful as QuestionnaireV2Answers['ym_reason_useful']
    if (!['yes', 'partially', 'no'].includes(ym_reason_useful)) {
      invalidPayload()
      return
    }

    const ux_least_intuitive = values.ux_least_intuitive as QuestionnaireV2Answers['ux_least_intuitive']
    if (!['dish', 'filter', 'wine_sheet', 'purchase_link', 'other'].includes(ux_least_intuitive)) {
      invalidPayload()
      return
    }

    const purchase_confidence = values.purchase_confidence as QuestionnaireV2Answers['purchase_confidence']
    if (!['yes', 'no', 'depends_price_rarity'].includes(purchase_confidence)) {
      invalidPayload()
      return
    }

    const purchase_clicked_link = values.purchase_clicked_link as QuestionnaireV2Answers['purchase_clicked_link']
    if (!['yes', 'no'].includes(purchase_clicked_link)) {
      invalidPayload()
      return
    }

    const modality_web_vs_app = values.modality_web_vs_app as QuestionnaireV2Answers['modality_web_vs_app']
    if (!['web', 'app'].includes(modality_web_vs_app)) {
      invalidPayload()
      return
    }

    const value_nps = parseNps(values.value_nps)
    if (value_nps === null) {
      invalidPayload()
      return
    }

    const answers: QuestionnaireV2Answers = {
      onboarding_scope_clarity,
      onboarding_ease_without_instructions,
      onboarding_first_impression: clampText(values.onboarding_first_impression, 2000),
      ym_suggestions_relevance,
      ym_reason_useful,
      ym_improve_suggestions: clampText(values.ym_improve_suggestions, 2000),
      ux_navigation_fluidity,
      ux_least_intuitive,
      ux_least_intuitive_other:
        ux_least_intuitive === 'other' ? clampText(values.ux_least_intuitive_other, 2000) : '',
      ux_technical_issues: clampText(values.ux_technical_issues, 2000),
      purchase_links_usefulness,
      purchase_confidence,
      purchase_clicked_link,
      value_real_world_usefulness,
      value_reuse_likelihood,
      value_nps,
      modality_web_vs_app,
      modality_liked_most: clampText(values.modality_liked_most, 2000),
      modality_liked_least: clampText(values.modality_liked_least, 2000),
      modality_feature_request: clampText(values.modality_feature_request, 2000),
    }

    const payload: QuestionnaireV2Payload = {
      version: 2,
      answers,
      locale: i18n.language.split('-')[0] ?? 'it',
      is_draft: false,
      metadata: {
        session_id: getOrCreateSurveySessionId() || undefined,
        referrer:
          typeof document !== 'undefined' && document.referrer
            ? document.referrer.slice(0, 500)
            : undefined,
        user_agent:
          typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : undefined,
      },
    }

    setStatus('loading')
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.functions.invoke('submit-survey', { body: payload })
      if (error) {
        const detail = getFunctionInvokeErrorMessage(data, error)
        throw new Error(detail ?? error.message)
      }
      if (
        data &&
        typeof data === 'object' &&
        'error' in data &&
        typeof (data as { error?: string }).error === 'string'
      ) {
        throw new Error((data as { error: string }).error)
      }
      setStatus('success')
    } catch (e) {
      setStatus('error')
      const msg = e instanceof Error ? e.message : ''
      if (msg) {
        setError('root', { type: 'server', message: msg })
      }
    }
  }

  const shell = embedded ? 'w-full' : 'w-full'

  const sectionTitle = embedded
    ? 'mt-4 font-serif text-lg font-normal text-wine-900 first:mt-0 sm:text-xl'
    : 'mt-10 font-serif text-xl font-normal text-wine-900 first:mt-0 sm:text-2xl'

  const qLabel = embedded
    ? 'text-sm font-normal leading-snug text-wine-900'
    : 'text-base font-normal leading-snug text-wine-900'

  const blockGap = embedded ? 'mt-3 space-y-3' : 'mt-6 space-y-8'

  const titleId = embedded ? 'survey-title' : pageTitleId

  return (
    <section
      className={embedded ? `${shell} flex min-h-0 flex-1 flex-col` : shell}
      aria-labelledby={titleId}
    >
      <div className={embedded ? 'flex min-h-0 w-full flex-1 flex-col' : 'w-full'}>
        {embedded && (
          <>
            <h2
              id="survey-title"
              className="font-serif text-xl font-normal leading-tight text-wine-900 sm:text-2xl"
            >
              {t('survey.title')}
            </h2>
            <p className="mt-1 text-sm leading-snug text-body">{t('survey.intro')}</p>
          </>
        )}

        {!embedded && <QuestionnaireProgressBar progress={progress} />}

        <form
          className={embedded ? 'mt-3 flex min-h-0 flex-1 flex-col gap-1' : 'mt-2 space-y-0'}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* Prima impressione */}
          <div className={blockGap}>
            <h3 className={sectionTitle}>{t('survey.v2.onboarding.title')}</h3>

            <div className="space-y-2">
              <p id="q-scope" className={qLabel}>
                {t('survey.v2.onboarding.q_scope.label')}
              </p>
              <Likert5<V2FormValues>
                name="onboarding_scope_clarity"
                register={register}
                labelLeft={t('survey.v2.onboarding.q_scope.l1')}
                labelRight={t('survey.v2.onboarding.q_scope.l5')}
                error={errors.onboarding_scope_clarity}
                compact={embedded}
                requiredMessage={req}
              />
            </div>

            <div className="space-y-2">
              <p id="q-ease" className={qLabel}>
                {t('survey.v2.onboarding.q_ease.label')}
              </p>
              <Likert5<V2FormValues>
                name="onboarding_ease_without_instructions"
                register={register}
                labelLeft={t('survey.v2.onboarding.q_ease.l1')}
                labelRight={t('survey.v2.onboarding.q_ease.l5')}
                error={errors.onboarding_ease_without_instructions}
                compact={embedded}
                requiredMessage={req}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="onboarding_first_impression" className={qLabel}>
                {t('survey.v2.onboarding.q_first.label')}
              </label>
              <textarea
                id="onboarding_first_impression"
                rows={embedded ? 2 : 3}
                maxLength={2000}
                placeholder={t('survey.v2.onboarding.q_first.placeholder')}
                className={`${inputClass} resize-y`}
                {...register('onboarding_first_impression')}
                aria-invalid={errors.onboarding_first_impression ? 'true' : 'false'}
              />
              {errors.onboarding_first_impression && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.onboarding_first_impression.message}
                </p>
              )}
            </div>
          </div>

          {/* YourMelier */}
          <div className={blockGap}>
            <h3 className={sectionTitle}>{t('survey.v2.ym.title')}</h3>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.ym.q_relevance.label')}</p>
              <Likert5<V2FormValues>
                name="ym_suggestions_relevance"
                register={register}
                labelLeft={t('survey.v2.ym.q_relevance.l1')}
                labelRight={t('survey.v2.ym.q_relevance.l5')}
                error={errors.ym_suggestions_relevance}
                compact={embedded}
                requiredMessage={req}
              />
            </div>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.ym.q_reason.label')}</p>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                <label className={radioBtn}>
                  <input
                    type="radio"
                    value="yes"
                    className="sr-only"
                    {...register('ym_reason_useful', { required: req })}
                  />
                  {t('survey.v2.ym.q_reason.yes')}
                </label>
                <label className={radioBtn}>
                  <input
                    type="radio"
                    value="partially"
                    className="sr-only"
                    {...register('ym_reason_useful', { required: req })}
                  />
                  {t('survey.v2.ym.q_reason.partially')}
                </label>
                <label className={radioBtn}>
                  <input
                    type="radio"
                    value="no"
                    className="sr-only"
                    {...register('ym_reason_useful', { required: req })}
                  />
                  {t('survey.v2.ym.q_reason.no')}
                </label>
              </div>
              {errors.ym_reason_useful && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.ym_reason_useful.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ym_improve_suggestions" className={qLabel}>
                {t('survey.v2.ym.q_improve.label')}
              </label>
              <textarea
                id="ym_improve_suggestions"
                rows={embedded ? 2 : 3}
                maxLength={2000}
                placeholder={t('survey.v2.ym.q_improve.placeholder')}
                className={`${inputClass} resize-y`}
                {...register('ym_improve_suggestions')}
              />
              {errors.ym_improve_suggestions && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.ym_improve_suggestions.message}
                </p>
              )}
            </div>
          </div>

          {/* UX */}
          <div className={blockGap}>
            <h3 className={sectionTitle}>{t('survey.v2.ux.title')}</h3>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.ux.q_nav.label')}</p>
              <Likert5<V2FormValues>
                name="ux_navigation_fluidity"
                register={register}
                labelLeft={t('survey.v2.ux.q_nav.l1')}
                labelRight={t('survey.v2.ux.q_nav.l5')}
                error={errors.ux_navigation_fluidity}
                compact={embedded}
                requiredMessage={req}
              />
            </div>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.ux.q_least.label')}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap" role="radiogroup">
                {(
                  [
                    ['dish', 'survey.v2.ux.q_least.dish'],
                    ['filter', 'survey.v2.ux.q_least.filter'],
                    ['wine_sheet', 'survey.v2.ux.q_least.wine_sheet'],
                    ['purchase_link', 'survey.v2.ux.q_least.purchase_link'],
                    ['other', 'survey.v2.ux.q_least.other'],
                  ] as const
                ).map(([val, key]) => (
                  <label key={val} className={radioBtn}>
                    <input
                      type="radio"
                      value={val}
                      className="sr-only"
                      {...register('ux_least_intuitive', { required: req })}
                    />
                    {t(key)}
                  </label>
                ))}
              </div>
              {errors.ux_least_intuitive && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.ux_least_intuitive.message}
                </p>
              )}
            </div>

            {uxLeast === 'other' && (
              <div className="space-y-1.5">
                <label htmlFor="ux_least_intuitive_other" className={qLabel}>
                  {t('survey.v2.ux.q_least_other_ph')}
                </label>
                <input
                  id="ux_least_intuitive_other"
                  type="text"
                  maxLength={2000}
                  className={inputClass}
                  {...register('ux_least_intuitive_other')}
                  aria-invalid={errors.ux_least_intuitive_other ? 'true' : 'false'}
                />
                {errors.ux_least_intuitive_other && (
                  <p className="text-sm text-red-700" role="alert">
                    {errors.ux_least_intuitive_other.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="ux_technical_issues" className={qLabel}>
                {t('survey.v2.ux.q_technical.label')}
              </label>
              <textarea
                id="ux_technical_issues"
                rows={embedded ? 2 : 3}
                maxLength={2000}
                placeholder={t('survey.v2.ux.q_technical.placeholder')}
                className={`${inputClass} resize-y`}
                {...register('ux_technical_issues')}
              />
              {errors.ux_technical_issues && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.ux_technical_issues.message}
                </p>
              )}
            </div>
          </div>

          {/* Acquisto */}
          <div className={blockGap}>
            <h3 className={sectionTitle}>{t('survey.v2.purchase.title')}</h3>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.purchase.q_links.label')}</p>
              <Likert5<V2FormValues>
                name="purchase_links_usefulness"
                register={register}
                labelLeft={t('survey.v2.purchase.q_links.l1')}
                labelRight={t('survey.v2.purchase.q_links.l5')}
                error={errors.purchase_links_usefulness}
                compact={embedded}
                requiredMessage={req}
              />
            </div>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.purchase.q_confidence.label')}</p>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                <label className={radioBtn}>
                  <input
                    type="radio"
                    value="yes"
                    className="sr-only"
                    {...register('purchase_confidence', { required: req })}
                  />
                  {t('survey.v2.purchase.q_confidence.yes')}
                </label>
                <label className={radioBtn}>
                  <input
                    type="radio"
                    value="no"
                    className="sr-only"
                    {...register('purchase_confidence', { required: req })}
                  />
                  {t('survey.v2.purchase.q_confidence.no')}
                </label>
                <label className={radioBtn}>
                  <input
                    type="radio"
                    value="depends_price_rarity"
                    className="sr-only"
                    {...register('purchase_confidence', { required: req })}
                  />
                  {t('survey.v2.purchase.q_confidence.depends')}
                </label>
              </div>
              {errors.purchase_confidence && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.purchase_confidence.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.purchase.q_clicked.label')}</p>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                <label className={radioBtn}>
                  <input
                    type="radio"
                    value="yes"
                    className="sr-only"
                    {...register('purchase_clicked_link', { required: req })}
                  />
                  {t('survey.v2.purchase.q_clicked.yes')}
                </label>
                <label className={radioBtn}>
                  <input
                    type="radio"
                    value="no"
                    className="sr-only"
                    {...register('purchase_clicked_link', { required: req })}
                  />
                  {t('survey.v2.purchase.q_clicked.no')}
                </label>
              </div>
              {errors.purchase_clicked_link && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.purchase_clicked_link.message}
                </p>
              )}
            </div>
          </div>

          {/* Valore */}
          <div className={blockGap}>
            <h3 className={sectionTitle}>{t('survey.v2.value.title')}</h3>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.value.q_real.label')}</p>
              <Likert5<V2FormValues>
                name="value_real_world_usefulness"
                register={register}
                labelLeft={t('survey.v2.value.q_real.l1')}
                labelRight={t('survey.v2.value.q_real.l5')}
                error={errors.value_real_world_usefulness}
                compact={embedded}
                requiredMessage={req}
              />
            </div>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.value.q_reuse.label')}</p>
              <Likert5<V2FormValues>
                name="value_reuse_likelihood"
                register={register}
                labelLeft={t('survey.v2.value.q_reuse.l1')}
                labelRight={t('survey.v2.value.q_reuse.l5')}
                error={errors.value_reuse_likelihood}
                compact={embedded}
                requiredMessage={req}
              />
            </div>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.value.q_nps.label')}</p>
              <Nps0to10<V2FormValues>
                name="value_nps"
                register={register}
                error={errors.value_nps}
                compact={embedded}
                requiredMessage={req}
              />
            </div>
          </div>

          {/* Modalità */}
          <div className={blockGap}>
            <h3 className={sectionTitle}>{t('survey.v2.modality.title')}</h3>

            <div className="space-y-2">
              <p className={qLabel}>{t('survey.v2.modality.q_platform.label')}</p>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                <label className={radioBtn}>
                  <input
                    type="radio"
                    value="web"
                    className="sr-only"
                    {...register('modality_web_vs_app', { required: req })}
                  />
                  {t('survey.v2.modality.q_platform.web')}
                </label>
                <label className={radioBtn}>
                  <input
                    type="radio"
                    value="app"
                    className="sr-only"
                    {...register('modality_web_vs_app', { required: req })}
                  />
                  {t('survey.v2.modality.q_platform.app')}
                </label>
              </div>
              {errors.modality_web_vs_app && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.modality_web_vs_app.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modality_liked_most" className={qLabel}>
                {t('survey.v2.modality.q_like_most.label')}
              </label>
              <textarea
                id="modality_liked_most"
                rows={embedded ? 2 : 3}
                maxLength={2000}
                placeholder={t('survey.v2.modality.q_like_most.placeholder')}
                className={`${inputClass} resize-y`}
                {...register('modality_liked_most')}
              />
              {errors.modality_liked_most && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.modality_liked_most.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modality_liked_least" className={qLabel}>
                {t('survey.v2.modality.q_like_least.label')}
              </label>
              <textarea
                id="modality_liked_least"
                rows={embedded ? 2 : 3}
                maxLength={2000}
                placeholder={t('survey.v2.modality.q_like_least.placeholder')}
                className={`${inputClass} resize-y`}
                {...register('modality_liked_least')}
              />
              {errors.modality_liked_least && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.modality_liked_least.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modality_feature_request" className={qLabel}>
                {t('survey.v2.modality.q_feature.label')}
              </label>
              <textarea
                id="modality_feature_request"
                rows={embedded ? 2 : 3}
                maxLength={2000}
                placeholder={t('survey.v2.modality.q_feature.placeholder')}
                className={`${inputClass} resize-y`}
                {...register('modality_feature_request')}
              />
              {errors.modality_feature_request && (
                <p className="text-sm text-red-700" role="alert">
                  {errors.modality_feature_request.message}
                </p>
              )}
            </div>
          </div>

          <div className={embedded ? 'mt-4 flex flex-col items-stretch gap-1.5 sm:flex-row sm:justify-end' : 'mt-10 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end'}>
            {status === 'success' && (
              <p className="text-sm text-wine-800 sm:mr-auto" role="status">
                {t('survey.success')}
              </p>
            )}
            {(errors.root || status === 'error') && (
              <p className="text-sm text-red-700 sm:mr-auto" role="alert">
                {errors.root?.message ?? t('survey.error')}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className={
                embedded
                  ? 'inline-flex min-h-9 min-w-[6rem] items-center justify-center self-end rounded-figma bg-wine-900 px-6 py-2 text-sm font-normal text-white outline-none transition hover:bg-wine-800 focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60'
                  : 'inline-flex min-h-11 w-full min-w-[12rem] items-center justify-center self-stretch rounded-figma bg-wine-900 px-10 py-3 text-base font-normal text-white outline-none transition hover:bg-wine-800 focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 sm:self-end sm:w-auto'
              }
            >
              {status === 'loading'
                ? t('survey.submitting')
                : embedded
                  ? t('survey.submit')
                  : t('survey.submitQuestionnaire')}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
