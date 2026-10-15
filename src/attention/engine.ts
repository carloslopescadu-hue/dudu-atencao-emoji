import type { FaceLandmarker } from '@mediapipe/tasks-vision'
import { LEVELS, type LevelId } from './levels'
import { baselineFrom, initialState, step, type Baseline, type ScorerState } from './scorer'
import { extractSignals, NO_FACE, type FrameSignals } from './signals'

export type Phase = 'calibrating' | 'running' | 'paused'

export interface SessionSummary {
  id: string
  startedAt: number
  durationSec: number
  avgScore: number
  levelSeconds: Record<LevelId, number>
  distractions: number
  longestFocusSec: number
  /** Uma nota por segundo (0–100). */
  timeline: number[]
}

export interface Snapshot {
  phase: Phase
  calibrationProgress: number
  signals: FrameSignals
  state: ScorerState
  elapsedSec: number
  /** Há quantos segundos o aluno está no nível atual. */
  levelSec: number
}

const TICK_MS = 100
const CALIBRATION_SAMPLES = 25

const emptyLevelSeconds = (): Record<LevelId, number> =>
  Object.fromEntries(LEVELS.map((l) => [l.id, 0])) as Record<LevelId, number>

/**
 * Lê a câmera cerca de 10 vezes por segundo, calcula a nota de atenção e
 * acumula as estatísticas da sessão. Toda a análise acontece no navegador.
 */
export class AttentionEngine {
  private video: HTMLVideoElement
  private landmarker: FaceLandmarker
  private onUpdate: (s: Snapshot) => void

  private timer: number | undefined
  private lastTick = 0
  private lastVideoTime = -1
  private lastSignals: FrameSignals = NO_FACE

  private phase: Phase = 'calibrating'
  private calibration: FrameSignals[] = []
  private baseline: Baseline | null = null
  private state: ScorerState = initialState()

  private startedAt = Date.now()
  private elapsed = 0
  private scoreTime = 0
  private levelSeconds = emptyLevelSeconds()
  private levelSince = 0
  private distractions = 0
  private focusStreak = 0
  private longestFocus = 0
  private timeline: number[] = []
  private nextSample = 0

  constructor(video: HTMLVideoElement, landmarker: FaceLandmarker, onUpdate: (s: Snapshot) => void) {
    this.video = video
    this.landmarker = landmarker
    this.onUpdate = onUpdate
  }

  start() {
    this.lastTick = performance.now()
    this.loop()
  }

  stop() {
    window.clearTimeout(this.timer)
    this.timer = undefined
  }

  pause() {
    if (this.phase === 'running') this.phase = 'paused'
    this.emit()
  }

  resume() {
    if (this.phase === 'paused') this.phase = 'running'
    this.emit()
  }

  recalibrate() {
    this.calibration = []
    this.phase = 'calibrating'
    this.emit()
  }

  summary(): SessionSummary {
    return {
      id: String(this.startedAt),
      startedAt: this.startedAt,
      durationSec: Math.round(this.elapsed),
      avgScore: this.elapsed > 0 ? this.scoreTime / this.elapsed : 0,
      levelSeconds: { ...this.levelSeconds },
      distractions: this.distractions,
      longestFocusSec: Math.round(Math.max(this.longestFocus, this.focusStreak)),
      timeline: [...this.timeline],
    }
  }

  private loop = () => {
    // setTimeout (e não requestAnimationFrame) para continuar medindo
    // quando a janela da aula fica na frente do app.
    this.timer = window.setTimeout(this.loop, TICK_MS)
    const now = performance.now()
    const dt = (now - this.lastTick) / 1000
    this.lastTick = now

    this.lastSignals = this.read(now) ?? this.lastSignals

    if (this.phase === 'calibrating') {
      if (this.lastSignals.face) this.calibration.push(this.lastSignals)
      if (this.calibration.length >= CALIBRATION_SAMPLES) {
        this.baseline = baselineFrom(this.calibration)
        this.phase = 'running'
      }
    } else if (this.phase === 'running' && this.baseline) {
      this.advance(dt)
    }
    this.emit()
  }

  private read(now: number): FrameSignals | null {
    const v = this.video
    if (v.readyState < 2 || v.videoWidth === 0) return null
    if (v.currentTime === this.lastVideoTime) return null
    this.lastVideoTime = v.currentTime
    return extractSignals(this.landmarker.detectForVideo(v, now))
  }

  private advance(dt: number) {
    const t = Math.min(dt, 2)
    const before = this.state.level
    this.state = step(this.state, this.lastSignals, this.baseline!, t)
    const level = this.state.level

    this.elapsed += t
    this.scoreTime += this.state.score * t
    this.levelSeconds[level] += t

    if (level !== before) {
      this.levelSince = this.elapsed
      const wasEngaged = before === 'focused' || before === 'drifting'
      if (wasEngaged && (level === 'distracted' || level === 'lost')) this.distractions++
    }

    if (level === 'focused') {
      this.focusStreak += t
    } else {
      this.longestFocus = Math.max(this.longestFocus, this.focusStreak)
      this.focusStreak = 0
    }

    while (this.elapsed >= this.nextSample) {
      this.timeline.push(Math.round(this.state.score))
      this.nextSample += 1
    }
  }

  private emit() {
    this.onUpdate({
      phase: this.phase,
      calibrationProgress: Math.min(this.calibration.length / CALIBRATION_SAMPLES, 1),
      signals: this.lastSignals,
      state: this.state,
      elapsedSec: this.elapsed,
      levelSec: this.elapsed - this.levelSince,
    })
  }
}
