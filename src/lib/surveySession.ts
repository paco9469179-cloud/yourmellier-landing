const SESSION_KEY = 'yourmellier-survey-session-id'

/** Id sessione browser per correlare invii (senza PII). */
export function getOrCreateSurveySessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}
