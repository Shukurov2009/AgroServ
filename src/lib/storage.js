import { createSeedState } from './seed'

const STORAGE_KEY = 'agroserv.state.v1'

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const seed = createSeedState()
    return {
      ...seed,
      ...parsed,
      settings: { ...seed.settings, ...(parsed.settings || {}) },
      session: parsed.session || null,
    }
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage to'lib qolsa, ilova ishlashda davom etadi.
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
