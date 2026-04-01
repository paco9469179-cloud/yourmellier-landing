/** Payload inviato a `submit-survey` con `version: 2`. */
export type Likert1to5 = 1 | 2 | 3 | 4 | 5

export type QuestionnaireV2Answers = {
  onboarding_scope_clarity: Likert1to5
  onboarding_ease_without_instructions: Likert1to5
  onboarding_first_impression: string
  ym_suggestions_relevance: Likert1to5
  ym_reason_useful: 'yes' | 'partially' | 'no'
  ym_improve_suggestions: string
  ux_navigation_fluidity: Likert1to5
  ux_least_intuitive: 'dish' | 'filter' | 'wine_sheet' | 'purchase_link' | 'other'
  ux_least_intuitive_other: string
  ux_technical_issues: string
  purchase_links_usefulness: Likert1to5
  purchase_confidence: 'yes' | 'no' | 'depends_price_rarity'
  purchase_clicked_link: 'yes' | 'no'
  value_real_world_usefulness: Likert1to5
  value_reuse_likelihood: Likert1to5
  value_nps: number
  modality_web_vs_app: 'web' | 'app'
  modality_liked_most: string
  modality_liked_least: string
  modality_feature_request: string
}

/** Metadati opzionali inviati alla Edge Function `submit-survey` (mapping DB lato server). */
export type QuestionnaireV2Metadata = {
  user_agent?: string
  referrer?: string
  session_id?: string
}

export type QuestionnaireV2Payload = {
  version: 2
  answers: QuestionnaireV2Answers
  locale: string
  /** Invio completo (non bozza). */
  is_draft?: boolean
  metadata?: QuestionnaireV2Metadata
}
