import { useTranslation } from 'react-i18next'

export function VideoSection() {
  const { t } = useTranslation()

  return (
    <section
      id="video"
      className="border-t border-fig-border bg-page px-6 py-section sm:py-20"
      aria-labelledby="video-heading"
    >
      <div className="mx-auto max-w-landing">
        <h2
          id="video-heading"
          className="font-serif text-fig-h2 font-normal text-wine-900"
        >
          {t('video.title')}
        </h2>
        <div className="mt-6 overflow-hidden rounded-card border border-fig-border/40 bg-fig-input shadow-card">
          <div className="aspect-video w-full">
            <video
              className="h-full w-full object-cover"
              controls
              preload="none"
              playsInline
              aria-label={t('video.title')}
            >
              <source src="/demo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
