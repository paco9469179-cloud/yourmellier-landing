import type { FieldError } from 'react-hook-form'
import type { Path, UseFormRegister } from 'react-hook-form'

type NpsProps<T extends Record<string, unknown>> = {
  name: Path<T>
  register: UseFormRegister<T>
  error?: FieldError
  compact?: boolean
  requiredMessage?: string
}

export function Nps0to10<T extends Record<string, unknown>>({
  name,
  register,
  error,
  compact,
  requiredMessage,
}: NpsProps<T>) {
  const btn = compact
    ? 'flex h-8 min-w-[1.5rem] cursor-pointer items-center justify-center rounded-figma border border-fig-border bg-page text-[0.65rem] font-medium text-fig-bezel transition hover:border-wine-900/40 has-[:checked]:border-wine-900 has-[:checked]:bg-wine-900 has-[:checked]:text-white sm:min-w-7 sm:text-xs'
    : 'flex h-9 min-w-[1.75rem] cursor-pointer items-center justify-center rounded-figma border border-fig-border bg-page text-xs font-medium text-fig-bezel transition hover:border-wine-900/40 has-[:checked]:border-wine-900 has-[:checked]:bg-wine-900 has-[:checked]:text-white sm:min-w-8 sm:text-sm'

  return (
    <div>
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="NPS 0–10">
        {Array.from({ length: 11 }, (_, i) => (
          <label key={i} className={btn}>
            <input
              type="radio"
              value={String(i)}
              className="sr-only"
              {...register(name, requiredMessage ? { required: requiredMessage } : {})}
            />
            <span>{i}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-700" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}
