import { useTranslation } from 'react-i18next'

/** Video demo 9:16, larghezza massima 375px (schema landing). */
export function AppPreview() {
  const { t } = useTranslation()

  return (
    <div id="app-preview" className="flex w-full flex-col items-center lg:items-start">
      <p className="mb-2 font-serif text-base font-normal text-wine-900 sm:text-lg">
        {t('video.sectionTitle')}
      </p>
      <p className="mb-2 text-center text-xs text-body-muted lg:text-left">
        {t('preview.specs')}
      </p>

      <div className="relative w-full max-w-[375px]">
        <div
          className="relative rounded-[1.75rem] border-[7px] border-fig-bezel bg-fig-bezel shadow-phone"
          data-node-id="636:556"
        >
          <div className="absolute left-1/2 top-2 z-10 h-1 w-12 -translate-x-1/2 rounded-full bg-black/40 sm:top-2.5" aria-hidden />
          <div className="overflow-hidden rounded-[1.25rem] bg-black">
            <div className="relative aspect-[9/16] w-full">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                controls
                playsInline
                preload="metadata"
                aria-label={t('video.title')}
              >
                <source src="/demo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center font-mono text-[0.65rem] text-body-muted sm:text-xs lg:text-left">
          {t('preview.fileName')}
        </p>
        <p className="mt-1 text-center text-[0.65rem] italic leading-tight text-wine-900/70 sm:text-xs lg:text-left">
          {t('preview.label')}
        </p>
      </div>
    </div>
  )
}
