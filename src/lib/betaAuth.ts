/** Sessione locale per accesso beta (localStorage). Scade 24h dopo l’ultimo accesso valido; persiste tra chiusura tab/browser. */

const LEGACY_AUTH_KEY = 'ym_beta_authenticated'
const LAST_ACCESS_KEY = 'ym_beta_last_access'

const SESSION_TTL_MS = 24 * 60 * 60 * 1000

function clearBetaSession(): void {
  localStorage.removeItem(LAST_ACCESS_KEY)
  localStorage.removeItem(LEGACY_AUTH_KEY)
  sessionStorage.removeItem(LAST_ACCESS_KEY)
  sessionStorage.removeItem(LEGACY_AUTH_KEY)
}

/** Migrazione da solo flag `true` senza timestamp: tratta come accesso appena avvenuto. */
function migrateLegacySession(): void {
  if (localStorage.getItem(LAST_ACCESS_KEY) != null) return
  if (localStorage.getItem(LEGACY_AUTH_KEY) === 'true') {
    localStorage.setItem(LAST_ACCESS_KEY, String(Date.now()))
    localStorage.removeItem(LEGACY_AUTH_KEY)
  }
}

/** Copia da sessionStorage (versione precedente) a localStorage se serve. */
function migrateFromSessionStorage(): void {
  if (localStorage.getItem(LAST_ACCESS_KEY) != null) return
  const fromSession = sessionStorage.getItem(LAST_ACCESS_KEY)
  if (fromSession != null) {
    localStorage.setItem(LAST_ACCESS_KEY, fromSession)
    sessionStorage.removeItem(LAST_ACCESS_KEY)
    return
  }
  if (sessionStorage.getItem(LEGACY_AUTH_KEY) === 'true') {
    localStorage.setItem(LAST_ACCESS_KEY, String(Date.now()))
    sessionStorage.removeItem(LEGACY_AUTH_KEY)
  }
}

function readLastAccessMs(): number | null {
  migrateFromSessionStorage()
  migrateLegacySession()
  const raw = localStorage.getItem(LAST_ACCESS_KEY)
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
  localStorage.setItem(LAST_ACCESS_KEY, String(Date.now()))
}

export function setBetaAuthenticated(value: boolean): void {
  if (value) {
    sessionStorage.removeItem(LEGACY_AUTH_KEY)
    sessionStorage.removeItem(LAST_ACCESS_KEY)
    localStorage.removeItem(LEGACY_AUTH_KEY)
    localStorage.setItem(LAST_ACCESS_KEY, String(Date.now()))
  } else {
    clearBetaSession()
  }
}
