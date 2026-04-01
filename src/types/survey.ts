/** Chiavi legacy questionario v1 (non più usate da `submit-survey`; solo v2). */
export const SURVEY_UI_KEYS = [
  'navigation',
  'visual_hierarchy',
  'typography',
  'colors',
] as const
export const SURVEY_UX_KEYS = ['speed', 'clarity', 'onboarding', 'search'] as const
export const SURVEY_FUNC_KEYS = ['comparison', 'filters', 'alerts', 'history'] as const
export const SURVEY_DATA_KEYS = ['prices', 'accuracy', 'coverage', 'updates'] as const

export type SurveyUiKey = (typeof SURVEY_UI_KEYS)[number]
export type SurveyUxKey = (typeof SURVEY_UX_KEYS)[number]
export type SurveyFuncKey = (typeof SURVEY_FUNC_KEYS)[number]
export type SurveyDataKey = (typeof SURVEY_DATA_KEYS)[number]

export type SurveyPayload = {
  useful: boolean
  usage_preference?: 'web' | 'mobile' | 'both' | 'none'
  improvements: {
    ui: string[]
    ux: string[]
    functionality: string[]
    data_quality: string[]
  }
  other_feedback: string
  locale: string
}
