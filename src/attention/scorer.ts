import { levelFor, type LevelId } from './levels'
import type { FrameSignals } from './signals'

export type Condition = 'noFace' | 'eyesClosed' | 'headTurned' | 'lookingAway' | 'yawning'
export type Reason = Condition | 'focused'

/** Posição "olhando para a aula", medida na calibração. */
export interface Baseline {
  yaw: number
  pitch: number
  gazeH: number
  gazeV: number
}

export interface ScorerState {
  score: number
  level: LevelId
  reason: Reason
  timers: Record<Condition, number>
}

// Ordem de prioridade: a primeira condição ativa explica o emoji.
const CONDITIONS: Condition[] = ['noFace', 'eyesClosed', 'headTurned', 'lookingAway', 'yawning']

/** Quanto tempo (s) a condição precisa durar para contar. Piscar ou olhar rápido não conta. */
const HOLD: Record<Condition, number> = {
  noFace: 1.5,
  eyesClosed: 1.2,
  headTurned: 1.0,
  lookingAway: 1.5,
  yawning: 1.2,
}

/** Para onde a nota vai (0–100) enquanto a condição dura. */
const TARGET: Record<Reason, number> = {
  focused: 100,
  yawning: 50,
  lookingAway: 30,
  headTurned: 20,
  eyesClosed: 10,
  noFace: 0,
}

export const THRESHOLDS = {
  eyesClosed: 0.55,
  yawDeg: 25,
  pitchDeg: 20,
  gazeH: 0.4,
  gazeV: 0.45,
  jawOpen: 0.55,
}

export function initialState(): ScorerState {
  return {
    score: 85,
    level: 'focused',
    reason: 'focused',
    timers: { noFace: 0, eyesClosed: 0, headTurned: 0, lookingAway: 0, yawning: 0 },
  }
}

export function activeConditions(s: FrameSignals, base: Baseline): Record<Condition, boolean> {
  if (!s.face) {
    return { noFace: true, eyesClosed: false, headTurned: false, lookingAway: false, yawning: false }
  }
  return {
    noFace: false,
    eyesClosed: s.eyesClosed > THRESHOLDS.eyesClosed,
    headTurned:
      Math.abs(s.yaw - base.yaw) > THRESHOLDS.yawDeg ||
      Math.abs(s.pitch - base.pitch) > THRESHOLDS.pitchDeg,
    lookingAway:
      Math.abs(s.gazeH - base.gazeH) > THRESHOLDS.gazeH ||
      Math.abs(s.gazeV - base.gazeV) > THRESHOLDS.gazeV,
    yawning: s.jawOpen > THRESHOLDS.jawOpen,
  }
}

/**
 * Avança a pontuação em `dt` segundos. A nota anda suavemente em direção ao alvo,
 * então o emoji reage em poucos segundos sem ficar piscando.
 */
export function step(prev: ScorerState, s: FrameSignals, base: Baseline, dt: number): ScorerState {
  const t = Math.min(Math.max(dt, 0), 2)
  const active = activeConditions(s, base)

  const timers = { ...prev.timers }
  for (const c of CONDITIONS) timers[c] = active[c] ? timers[c] + t : 0

  const held = CONDITIONS.find((c) => timers[c] >= HOLD[c])
  const pending = CONDITIONS.some((c) => active[c])
  // Enquanto uma condição nova ainda não completou o tempo mínimo, a nota fica parada:
  // assim trocar de "olhando para o lado" para "saiu da câmera" não dá um pico falso de foco.
  const reason: Reason = held ?? (pending ? prev.reason : 'focused')
  const target = held ? TARGET[held] : pending ? prev.score : TARGET.focused
  // Cai em ~3 s e se recupera um pouco mais rápido, para premiar a volta do foco.
  const tau = target < prev.score ? 3 : 2.2
  const score = prev.score + (target - prev.score) * (1 - Math.exp(-t / tau))

  return { score, level: levelFor(score, prev.level), reason, timers }
}

export function median(values: number[]): number {
  if (!values.length) return 0
  const v = [...values].sort((a, b) => a - b)
  const mid = v.length >> 1
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2
}

export function baselineFrom(samples: FrameSignals[]): Baseline {
  return {
    yaw: median(samples.map((s) => s.yaw)),
    pitch: median(samples.map((s) => s.pitch)),
    gazeH: median(samples.map((s) => s.gazeH)),
    gazeV: median(samples.map((s) => s.gazeV)),
  }
}
