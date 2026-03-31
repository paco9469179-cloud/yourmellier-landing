import { useState } from 'react'
import { useForm, useWatch, type UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { getSupabase } from '../../lib/supabase'
import { stripHtmlTags } from '../../lib/sanitize'
import {
  SURVEY_DATA_KEYS,
  SURVEY_FUNC_KEYS,
  SURVEY_UI_KEYS,
  SURVEY_UX_KEYS,
  type SurveyPayload,
} from '../../types/survey'

type FormValues = {
  useful: 'yes' | 'no' | ''
  usage: 'web' | 'mobile' | 'both' | 'none' | ''
  ui: string[]
  ux: string[]
  func: string[]
  data: string[]
  other: string
}

const inputClass =
  'w-full rounded-figma border border-fig-border bg-fig-input px-3 py-2.5 text-base text-body outline-none transition placeholder:text-body/50 focus:border-wine-900 focus:ring-2 focus:ring-wine-900/20'

type SurveyFormProps = {
  embedded?: boolean
}

export function SurveyForm({ embedded = false }: SurveyFormProps) {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      useful: '',
      usage: '',
      ui: [],
      ux: [],
      func: [],
      data: [],
      other: '',
    },
  })

  const useful = useWatch({ control, name: 'useful' })

  const onSubmit = async (values: FormValues) => {
    if (values.useful === 'yes' && !values.usage) {
      setError('usage', { type: 'manual', message: t('survey.validation.usage') })
      return
    }

    const other = stripHtmlTags(values.other)
    if (other.length > 2000) {
      setError('other', { type: 'manual', message: t('survey.validation.other') })
      return
    }

    const payload: SurveyPayload = {
      useful: values.useful === 'yes',
      usage_preference:
        values.useful === 'yes' && values.usage
          ? (values.usage as SurveyPayload['usage_preference'])
          : undefined,
      improvements: {
        ui: values.ui,
        ux: values.ux,
        functionality: values.func,
        data_quality: values.data,
      },
      other_feedback: other,
      locale: i18n.language.split('-')[0] ?? 'it',
    }

    setStatus('loading')
    try {
      const supabase = getSupabase()
      const { error } = await supabase.functions.invoke('submit-survey', { body: payload })
      if (error) throw error
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const radioClass = (selected: boolean) =>
    `min-h-11 min-w-11 rounded-figma border text-base font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
      selected
        ? 'border-wine-900 bg-wine-900 text-white'
        : 'border-fig-border bg-page text-fig-bezel hover:border-wine-900/40'
    }`

  const shell = embedded
    ? 'w-full'
    : 'border-b border-fig-border bg-page px-4 py-section sm:py-20'

  return (
    <section className={shell} aria-labelledby="survey-title">
      <div className={embedded ? 'w-full' : 'mx-auto max-w-content'}>
        <h2
          id="survey-title"
          className="font-serif text-fig-h2 font-normal leading-9 text-wine-900 md:leading-9"
        >
          {t('survey.title')}
        </h2>
        <p className="mt-4 text-base leading-6 text-body">{t('survey.intro')}</p>

        <form className="mt-10 space-y-10" onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset className="space-y-4">
            <legend className="text-lg font-normal text-wine-900">{t('survey.q1.label')}</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('survey.q1.label')}>
              {(['yes', 'no'] as const).map((v) => (
                <label key={v} className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value={v}
                    className="sr-only"
                    {...register('useful', { required: t('survey.validation.useful') })}
                  />
                  <span className={radioClass(useful === v)}>{t(`survey.q1.${v}`)}</span>
                </label>
              ))}
            </div>
            {errors.useful && (
              <p className="text-sm text-red-700" role="alert">
                {errors.useful.message}
              </p>
            )}
          </fieldset>

          {useful === 'yes' && (
            <div>
              <label htmlFor="usage" className="block text-lg font-normal text-wine-900">
                {t('survey.q2.label')}
              </label>
              <select
                id="usage"
                className={`${inputClass} mt-2`}
                {...register('usage')}
                aria-invalid={errors.usage ? 'true' : 'false'}
              >
                <option value="">{t('survey.q2.placeholder')}</option>
                <option value="web">{t('survey.q2.web')}</option>
                <option value="mobile">{t('survey.q2.mobile')}</option>
                <option value="both">{t('survey.q2.both')}</option>
                <option value="none">{t('survey.q2.none')}</option>
              </select>
              {errors.usage && (
                <p className="mt-1 text-sm text-red-700" role="alert">
                  {errors.usage.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-6">
            <CheckboxGroup
              legend={t('survey.q3.ui.legend')}
              name="ui"
              keys={[...SURVEY_UI_KEYS]}
              tPrefix="survey.q3.ui"
              register={register}
            />
            <CheckboxGroup
              legend={t('survey.q3.ux.legend')}
              name="ux"
              keys={[...SURVEY_UX_KEYS]}
              tPrefix="survey.q3.ux"
              register={register}
            />
            <CheckboxGroup
              legend={t('survey.q3.func.legend')}
              name="func"
              keys={[...SURVEY_FUNC_KEYS]}
              tPrefix="survey.q3.func"
              register={register}
            />
            <CheckboxGroup
              legend={t('survey.q3.data.legend')}
              name="data"
              keys={[...SURVEY_DATA_KEYS]}
              tPrefix="survey.q3.data"
              register={register}
            />
          </div>

          <div>
            <label htmlFor="other" className="block text-lg font-normal text-wine-900">
              {t('survey.q4.label')}
            </label>
            <textarea
              id="other"
              rows={5}
              maxLength={2000}
              placeholder={t('survey.q4.placeholder')}
              className={`${inputClass} mt-2 resize-y`}
              {...register('other')}
              aria-invalid={errors.other ? 'true' : 'false'}
              aria-describedby={errors.other ? 'other-error' : undefined}
            />
            {errors.other && (
              <p id="other-error" className="mt-1 text-sm text-red-700" role="alert">
                {errors.other.message}
              </p>
            )}
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
            {status === 'success' && (
              <p className="text-sm text-wine-800 sm:mr-auto" role="status">
                {t('survey.success')}
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-700 sm:mr-auto" role="alert">
                {t('survey.error')}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex min-h-11 min-w-[7rem] items-center justify-center rounded-figma bg-wine-900 px-10 py-4 text-base font-normal text-white outline-none transition hover:bg-wine-800 focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'loading' ? t('survey.submitting') : t('survey.submit')}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

function CheckboxGroup({
  legend,
  name,
  keys,
  tPrefix,
  register,
}: {
  legend: string
  name: 'ui' | 'ux' | 'func' | 'data'
  keys: readonly string[]
  tPrefix: string
  register: UseFormRegister<FormValues>
}) {
  const { t } = useTranslation()

  return (
    <fieldset className="space-y-2 rounded-figma border border-fig-border bg-fig-input/40 p-4">
      <legend className="text-lg font-normal text-wine-900">{legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {keys.map((k) => (
          <label
            key={k}
            className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 text-sm text-body hover:bg-page"
          >
            <input
              type="checkbox"
              value={k}
              className="mt-1 size-4 rounded border-fig-border text-wine-900 focus:ring-wine-900"
              {...register(name)}
            />
            <span>{t(`${tPrefix}.${k}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
