import type { FieldError } from 'react-hook-form'
import type { Path, UseFormRegister } from 'react-hook-form'

type Likert5Props<T extends Record<string, unknown>> = {
  name: Path<T>
  register: UseFormRegister<T>
  labelLeft: string
  labelRight: string
  error?: FieldError
  compact?: boolean
  /** If set, field is required with this message (RHF). */
  requiredMessage?: string
}

export function Likert5<T extends Record<string, unknown>>({
  name,
  register,
  labelLeft,
  labelRight,
  error,
  compact,
  requiredMessage,
}: Likert5Props<T>) {
  const scale = [1, 2, 3, 4, 5] as const
  const btn = compact
    ? 'flex h-9 min-w-[2.25rem] items-center justify-center rounded-figma border border-fig-border bg-page text-sm font-medium text-fig-bezel transition hover:border-wine-900/40 has-[:checked]:border-wine-900 has-[:checked]:bg-wine-900 has-[:checked]:text-white'
    : 'flex h-10 min-w-10 items-center justify-center rounded-figma border border-fig-border bg-page text-sm font-medium text-fig-bezel transition hover:border-wine-900/40 has-[:checked]:border-wine-900 has-[:checked]:bg-wine-900 has-[:checked]:text-white'

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2" role="radiogroup">
        {scale.map((n) => (
          <label key={n} className={`cursor-pointer ${btn}`}>
            <input
              type="radio"
              value={String(n)}
              className="sr-only"
              {...register(name, requiredMessage ? { required: requiredMessage } : {})}
            />
            <span>{n}</span>
          </label>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between gap-2 text-[0.65rem] leading-tight text-body-muted sm:text-xs">
        <span className="max-w-[45%] text-left">{labelLeft}</span>
        <span className="max-w-[45%] text-right">{labelRight}</span>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-700" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}
