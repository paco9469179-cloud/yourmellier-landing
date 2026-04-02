import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { isBetaAuthenticated, setBetaAuthenticated, touchBetaSession } from '../../lib/betaAuth'

type LoginFormValues = {
  username: string
  password: string
}

/** Placeholder: sostituire con chiamata Edge Function / Supabase quando pronto. */
async function signInPlaceholder(_values: LoginFormValues): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  setBetaAuthenticated(true)
}

export function LoginPage() {
  const navigate = useNavigate()

  /** Se la sessione beta è ancora valida, non mostrare il login: vai alla landing. */
  useEffect(() => {
    if (isBetaAuthenticated()) {
      touchBetaSession()
      navigate('/beta', { replace: true })
    }
  }, [navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: 'onBlur',
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = handleSubmit(async (data) => {
    await signInPlaceholder(data)
    navigate('/beta', { replace: true })
  })

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4 font-sans">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-lg border border-neutral-300 bg-white p-6 shadow-sm"
        noValidate
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm text-neutral-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-invalid={errors.username ? 'true' : 'false'}
              {...register('username', { required: 'Inserisci lo username' })}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-neutral-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-invalid={errors.password ? 'true' : 'false'}
              {...register('password', { required: 'Inserisci la password' })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-md bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting ? 'Accesso…' : 'Accedi'}
        </button>
      </form>
    </div>
  )
}
