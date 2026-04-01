/** Sessione locale per accesso beta (sessionStorage). Scade 24h dopo l'ultimo accesso valido. */

const LEGACY_AUTH_KEY = 'ym_beta_authenticated'
const LAST_ACCESS_KEY = 'ym_beta_last_access'

const SESSION_TTL_MS = 24 * 60 * 60 * 1000

function clearBetaSession(): void {
  sessionStorage.removeItem(LAST_ACCESS_KEY)
  sessionStorage.removeItem(LEGACY_AUTH_KEY)
}

/** Migrazione da solo flag `true` senza timestamp: tratta come accesso appena avvenuto. */
function migrateLegacySession(): void {
  if (sessionStorage.getItem(LAST_ACCESS_KEY) != null) return
  if (sessionStorage.getItem(LEGACY_AUTH_KEY) === 'true') {
    sessionStorage.setItem(LAST_ACCESS_KEY, String(Date.now()))
    sessionStorage.removeItem(LEGACY_AUTH_KEY)
  }
}

function readLastAccessMs(): number | null {
  migrateLegacySession()
  const raw = sessionStorage.getItem(LAST_ACCESS_KEY)
  if (raw == null) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/** True se esiste una sessione non scaduta (non aggiorna il timestamp). */
export function isBetaAuthenticated(): boolean {
  const last = readLastAccessMs()
  if (last == null) return false
  if (Date.now() - last > SESSION_TTL_MS) {
    clearBetaSession()
    return false
  }
  return true
}

/** Aggiorna l’istante dell’ultimo accesso (chiamare dopo un controllo `isBetaAuthenticated()` positivo). */
export function touchBetaSession(): void {
  const last = readLastAccessMs()
  if (last == null) return
  if (Date.now() - last > SESSION_TTL_MS) {
    clearBetaSession()
    return
  }
  sessionStorage.setItem(LAST_ACCESS_KEY, String(Date.now()))
}

export function setBetaAuthenticated(value: boolean): void {
  if (value) {
    sessionStorage.removeItem(LEGACY_AUTH_KEY)
    sessionStorage.setItem(LAST_ACCESS_KEY, String(Date.now()))
  } else {
    clearBetaSession()
  }
}
