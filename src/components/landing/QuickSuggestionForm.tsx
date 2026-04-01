import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { getSupabase } from '../../lib/supabase'
import { stripHtmlTags } from '../../lib/sanitize'

type FormValues = {
  category: 'bug' | 'feature' | 'improvement' | 'other' | ''
  message: string
}

const inputClass =
  'w-full rounded-figma border border-fig-border bg-fig-input px-3 py-2 text-base text-body outline-none transition focus:border-wine-900 focus:ring-2 focus:ring-wine-900/20'

export function QuickSuggestionForm() {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { category: '', message: '' },
  })

  const onSubmit = async (values: FormValues) => {
    if (!values.category) {
      setError('category', { type: 'manual', message: t('suggestions.validation.category') })
      return
    }
    const message = stripHtmlTags(values.message)
    if (!message.trim()) {
      setError('message', { type: 'manual', message: t('suggestions.validation.message') })
      return
    }
    if (message.length > 2000) {
      setError('message', { type: 'manual', message: t('suggestions.validation.length') })
      return
    }

    setStatus('loading')
    try {
      const supabase = getSupabase()
      const { error } = await supabase.functions.invoke('submit-suggestion', {
        body: {
          category: values.category,
          message,
          locale: i18n.language.split('-')[0] ?? 'it',
        },
      })
      if (error) throw error
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="border-t border-fig-border bg-page px-4 py-10 sm:py-12" aria-labelledby="quick-suggestion-title">
      <div className="mx-auto max-w-landing">
        <h2 id="quick-suggestion-title" className="font-serif text-lg font-normal text-wine-900 sm:text-xl">
          {t('landing.quickSuggestionTitle')}
        </h2>

        <form
          className="mt-4 rounded-card border border-fig-border/30 bg-surface p-4 shadow-card sm:p-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <label htmlFor="qs-category" className="block text-sm font-medium text-wine-900">
                {t('suggestions.category')}
              </label>
              <select
                id="qs-category"
                className={`${inputClass} mt-1.5`}
                {...register('category')}
                aria-invalid={errors.category ? 'true' : 'false'}
              >
                <option value="">{t('suggestions.categoryPlaceholder')}</option>
                <option value="bug">{t('suggestions.categories.bug')}</option>
                <option value="feature">{t('suggestions.categories.feature')}</option>
                <option value="improvement">{t('suggestions.categories.improvement')}</option>
                <option value="other">{t('suggestions.categories.other')}</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-700" role="alert">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <label htmlFor="qs-message" className="block text-sm font-medium text-wine-900">
                {t('suggestions.message')}
              </label>
              <textarea
                id="qs-message"
                rows={3}
                maxLength={2000}
                placeholder={t('suggestions.messagePlaceholder')}
                className={`${inputClass} mt-1.5 resize-y`}
                {...register('message')}
                aria-invalid={errors.message ? 'true' : 'false'}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-700" role="alert">
                  {errors.message.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {status === 'success' && (
              <p className="text-sm text-wine-800" role="status">
                {t('suggestions.success')}
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-700" role="alert">
                {t('suggestions.error')}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex min-h-10 items-center justify-center self-end rounded-figma bg-wine-900 px-8 py-2 text-sm font-medium text-white outline-none transition hover:bg-wine-800 focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              {status === 'loading' ? t('suggestions.submitting') : t('landing.quickSuggestionSubmit')}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
