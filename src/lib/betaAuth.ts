/**
 * Sessione beta: stesso timestamp salvato su localStorage, sessionStorage e cookie (first-party).
 * Su Chrome mobile (e link da altre app) un solo canale può non bastare; la logica TTL resta 24h dall’ultimo accesso.
 */

const LEGACY_AUTH_KEY = 'ym_beta_authenticated'
const LAST_ACCESS_KEY = 'ym_beta_last_access'
const COOKIE_NAME = 'ym_beta_last_access'
/** Il browser può tenere il cookie più a lungo; la scadenza reale è sempre `SESSION_TTL_MS` in JS. */
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30

const SESSION_TTL_MS = 24 * 60 * 60 * 1000

function safeLocalGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeLocalSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* quota / modalità restrittiva */
  }
}

function safeLocalRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function safeSessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSessionSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

function safeSessionRemove(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function setCookieTimestamp(ms: string): void {
  if (typeof document === 'undefined') return
  const secure =
    typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(ms)}; Max-Age=${COOKIE_MAX_AGE_SEC}; Path=/; SameSite=Lax${secure}`
}

function getCookieTimestamp(): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : null
}

function clearCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/`
}

/** Scrive lo stesso timestamp ovunque sia possibile (Chrome mobile incluso). */
function persistLastAccess(ms: string): void {
  safeLocalSet(LAST_ACCESS_KEY, ms)
  safeSessionSet(LAST_ACCESS_KEY, ms)
  setCookieTimestamp(ms)
}

function clearBetaSession(): void {
  safeLocalRemove(LAST_ACCESS_KEY)
  safeLocalRemove(LEGACY_AUTH_KEY)
  safeSessionRemove(LAST_ACCESS_KEY)
  safeSessionRemove(LEGACY_AUTH_KEY)
  clearCookie()
}

/** Migrazione da solo flag `true` senza timestamp: tratta come accesso appena avvenuto. */
function migrateLegacySession(): void {
  if (safeLocalGet(LAST_ACCESS_KEY) != null) return
  if (safeLocalGet(LEGACY_AUTH_KEY) === 'true') {
    persistLastAccess(String(Date.now()))
    safeLocalRemove(LEGACY_AUTH_KEY)
  }
}

/** Copia da sessionStorage (versione precedente) a persistenza completa se serve. */
function migrateFromSessionStorage(): void {
  if (safeLocalGet(LAST_ACCESS_KEY) != null) return
  const fromSession = safeSessionGet(LAST_ACCESS_KEY)
  if (fromSession != null) {
    persistLastAccess(fromSession)
    safeSessionRemove(LAST_ACCESS_KEY)
    return
  }
  if (safeSessionGet(LEGACY_AUTH_KEY) === 'true') {
    persistLastAccess(String(Date.now()))
    safeSessionRemove(LEGACY_AUTH_KEY)
  }
}

function readLastAccessMs(): number | null {
  migrateFromSessionStorage()
  migrateLegacySession()

  let raw: string | null = safeLocalGet(LAST_ACCESS_KEY)
  if (raw == null) raw = getCookieTimestamp()
  if (raw == null) raw = safeSessionGet(LAST_ACCESS_KEY)

  if (raw != null && safeLocalGet(LAST_ACCESS_KEY) == null) {
    persistLastAccess(raw)
  }

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
  persistLastAccess(String(Date.now()))
}

export function setBetaAuthenticated(value: boolean): void {
  if (value) {
    safeSessionRemove(LEGACY_AUTH_KEY)
    safeLocalRemove(LEGACY_AUTH_KEY)
    persistLastAccess(String(Date.now()))
  } else {
    clearBetaSession()
  }
}
