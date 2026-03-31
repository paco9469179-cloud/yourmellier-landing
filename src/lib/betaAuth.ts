/** Session locale per accesso beta (placeholder fino a integrazione auth reale). */
const BETA_AUTH_KEY = 'ym_beta_authenticated'

export function isBetaAuthenticated(): boolean {
  return sessionStorage.getItem(BETA_AUTH_KEY) === 'true'
}

export function setBetaAuthenticated(value: boolean): void {
  if (value) {
    sessionStorage.setItem(BETA_AUTH_KEY, 'true')
  } else {
    sessionStorage.removeItem(BETA_AUTH_KEY)
  }
}
