import type { SessionSummary } from './attention/engine'

const KEY = 'focusmoji.sessions'
const MAX = 12

// O histórico fica só neste navegador (localStorage).
export function loadHistory(): SessionSummary[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SessionSummary[]) : []
  } catch {
    return []
  }
}

export function saveSession(s: SessionSummary): SessionSummary[] {
  const list = [s, ...loadHistory().filter((x) => x.id !== s.id)].slice(0, MAX)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* sem armazenamento disponível */
  }
  return list
}
