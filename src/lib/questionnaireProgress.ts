/**
 * Calcola completamento questionario v2: domande con risposta / domande totali.
 * Se è selezionato «Altro» per UX, conta anche il testo obbligatorio come domanda extra.
 */
function str(v: string | undefined): string {
  return v ?? ''
}

function isChoice(v: string | undefined): boolean {
  return str(v) !== ''
}

function isText(v: string | undefined): boolean {
  return str(v).trim().length > 0
}

export type QuestionnaireProgress = {
  answered: number
  total: number
  percent: number
}

export function computeQuestionnaireProgress(values: Record<string, string | undefined>): QuestionnaireProgress {
  let answered = 0
  let total = 0

  const addChoice = (field: string | undefined) => {
    total += 1
    if (isChoice(field)) answered += 1
  }

  const addText = (field: string | undefined) => {
    total += 1
    if (isText(field)) answered += 1
  }

  addChoice(values.onboarding_scope_clarity)
  addChoice(values.onboarding_ease_without_instructions)
  addText(values.onboarding_first_impression)
  addChoice(values.ym_suggestions_relevance)
  addChoice(values.ym_reason_useful)
  addText(values.ym_improve_suggestions)
  addChoice(values.ux_navigation_fluidity)
  addChoice(values.ux_least_intuitive)
  if (values.ux_least_intuitive === 'other') {
    addText(values.ux_least_intuitive_other)
  }
  addText(values.ux_technical_issues)
  addChoice(values.purchase_links_usefulness)
  addChoice(values.purchase_confidence)
  addChoice(values.purchase_clicked_link)
  addChoice(values.value_real_world_usefulness)
  addChoice(values.value_reuse_likelihood)
  addChoice(values.value_nps)
  addChoice(values.modality_web_vs_app)
  addText(values.modality_liked_most)
  addText(values.modality_liked_least)
  addText(values.modality_feature_request)

  const percent = total === 0 ? 0 : Math.min(100, Math.round((answered / total) * 100))
  return { answered, total, percent }
}
