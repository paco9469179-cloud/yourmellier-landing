import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { getSupabase } from '../../lib/supabase'
import { stripHtmlTags } from '../../lib/sanitize'

type FormValues = {
  name: string
  email: string
  category: '' | 'bug' | 'feature' | 'improvement' | 'other'
  message: string
}

const inputClass =
  'w-full rounded-figma border border-fig-border bg-fig-input px-3 py-2.5 text-base text-body outline-none transition placeholder:text-body/50 focus:border-wine-900 focus:ring-2 focus:ring-wine-900/20'

type SuggestionsFormProps = {
  embedded?: boolean
}

export function SuggestionsForm({ embedded = false }: SuggestionsFormProps) {
  const { t, i18n } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      category: '',
      message: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    const name = stripHtmlTags(values.name).slice(0, 100)
    const email = stripHtmlTags(values.email).trim()
    const message = stripHtmlTags(values.message)

    if (message.length > 2000) {
      return
    }

    const payload = {
      name: name || undefined,
      email: email || undefined,
      category: values.category,
      message,
      locale: i18n.language.split('-')[0] ?? 'it',
    }

    setStatus('loading')
    try {
      const supabase = getSupabase()
      const { error } = await supabase.functions.invoke('submit-suggestion', { body: payload })
      if (error) throw error
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const shell = embedded
    ? 'w-full'
    : 'border-b border-fig-border bg-page px-4 py-section sm:py-20'

  return (
    <section className={shell} aria-labelledby="suggestions-title">
      <div className={embedded ? 'w-full' : 'mx-auto max-w-content'}>
        <h2
          id="suggestions-title"
          className="font-serif text-fig-h2 font-normal leading-9 text-wine-900 md:leading-9"
        >
          {t('suggestions.title')}
        </h2>
        {!embedded && (
          <p className="mt-4 text-base leading-6 text-body">{t('suggestions.intro')}</p>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="s-name" className="block text-base font-normal text-body">
              {t('suggestions.name')}
            </label>
            <input
              id="s-name"
              type="text"
              maxLength={100}
              autoComplete="name"
              className={`${inputClass} mt-2`}
              {...register('name')}
            />
          </div>

          <div>
            <label htmlFor="s-email" className="block text-base font-normal text-body">
              {t('suggestions.email')}
            </label>
            <input
              id="s-email"
              type="email"
              autoComplete="email"
              className={`${inputClass} mt-2`}
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email', {
                validate: (v) =>
                  !v ||
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
                  t('suggestions.validation.email'),
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-700" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="s-cat" className="block text-lg font-normal text-wine-900">
              {t('suggestions.category')}
            </label>
            <select
              id="s-cat"
              className={`${inputClass} mt-2`}
              {...register('category', {
                required: t('suggestions.validation.category'),
              })}
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

          <div>
            <label htmlFor="s-msg" className="block text-lg font-normal text-wine-900">
              {t('suggestions.message')}
            </label>
            <textarea
              id="s-msg"
              rows={5}
              maxLength={2000}
              placeholder={t('suggestions.messagePlaceholder')}
              className={`${inputClass} mt-2 resize-y`}
              {...register('message', {
                required: t('suggestions.validation.message'),
                validate: (v) =>
                  stripHtmlTags(v).length <= 2000 || t('suggestions.validation.length'),
              })}
              aria-invalid={errors.message ? 'true' : 'false'}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-700" role="alert">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
            {status === 'success' && (
              <p className="text-sm text-wine-800 sm:mr-auto" role="status">
                {t('suggestions.success')}
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-700 sm:mr-auto" role="alert">
                {t('suggestions.error')}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex min-h-11 min-w-[7rem] items-center justify-center rounded-figma bg-wine-900 px-10 py-4 text-base font-normal text-white outline-none transition hover:bg-wine-800 focus-visible:ring-2 focus-visible:ring-wine-900 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'loading' ? t('suggestions.submitting') : t('suggestions.submit')}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
