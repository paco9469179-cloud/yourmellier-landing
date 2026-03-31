import { useTranslation } from 'react-i18next'

/** Screenshot da Figma (MCP asset; sostituire con asset locale in produzione se necessario). */
const WEB_APP_SHOWCASE =
  'https://www.figma.com/api/mcp/asset/9709221e-2ee5-4438-9662-822571dd0603'

export function AppPreview() {
  const { t } = useTranslation()

  return (
    <div className="flex w-full justify-center lg:justify-start">
      <div className="relative w-full max-w-md">
        <div
          className="relative rounded-phone border-8 border-fig-bezel bg-surface p-6 shadow-phone"
          data-node-id="636:556"
        >
          <div
            className="absolute left-1/2 top-6 z-10 h-1 w-16 -translate-x-1/2 rounded-xl bg-fig-bezel"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-surface">
            <div className="relative aspect-[9/16] max-h-[min(674px,70vh)] w-full overflow-hidden sm:max-h-[674px]">
              <img
                src={WEB_APP_SHOWCASE}
                alt=""
                className="absolute left-1/2 h-full max-w-none -translate-x-[30%] object-cover opacity-80 mix-blend-multiply"
                width={800}
                height={1200}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[rgba(110,79,50,0.1)]" aria-hidden />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative rounded-lg border border-white/50 bg-[rgba(240,237,228,0.9)] p-6 shadow-overlay backdrop-blur-sm">
                  <p className="max-w-[11rem] text-center font-serif text-sm italic leading-snug text-wine-900">
                    {t('preview.label')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
