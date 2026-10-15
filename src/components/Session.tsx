import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AttentionEngine, type SessionSummary, type Snapshot } from '../attention/engine'
import { LEVEL_BY_ID } from '../attention/levels'
import { chime, unlockAudio } from '../chime'
import type { STRINGS } from '../i18n'
import { FocusFace } from './FocusFace'
import { PipPortal, pipSupported, usePip } from './PipPortal'

type Status = 'camera' | 'model' | 'live' | 'error'
type ErrorKind = 'camera' | 'noCamera' | 'model'

interface Props {
  t: (typeof STRINGS)['pt']
  onEnd: (summary: SessionSummary) => void
  onCancel: () => void
}

const ALERT_AFTER_SEC = 8
const ALERT_GAP_MS = 30_000

export function Session({ t, onEnd, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const engineRef = useRef<AttentionEngine | null>(null)
  const lastChime = useRef(0)
  const [status, setStatus] = useState<Status>('camera')
  const [error, setError] = useState<ErrorKind | null>(null)
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [showCamera, setShowCamera] = useState(true)
  const [sound, setSound] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const pip = usePip()

  useEffect(() => {
    let cancelled = false
    let stream: MediaStream | null = null

    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        })
      } catch (err) {
        if (cancelled) return
        const name = (err as DOMException).name
        setError(name === 'NotFoundError' || name === 'OverconstrainedError' ? 'noCamera' : 'camera')
        setStatus('error')
        return
      }
      if (cancelled) {
        stream.getTracks().forEach((tr) => tr.stop())
        return
      }
      const video = videoRef.current!
      video.srcObject = stream
      await video.play().catch(() => {})

      setStatus('model')
      try {
        // O MediaPipe só é baixado quando a sessão começa.
        const { getLandmarker } = await import('../attention/detector')
        const landmarker = await getLandmarker()
        if (cancelled) return
        const engine = new AttentionEngine(video, landmarker, setSnap)
        engineRef.current = engine
        engine.start()
        setStatus('live')
      } catch {
        if (cancelled) return
        setError('model')
        setStatus('error')
      }
    })()

    return () => {
      cancelled = true
      engineRef.current?.stop()
      engineRef.current = null
      stream?.getTracks().forEach((tr) => tr.stop())
    }
  }, [attempt])

  const level = snap?.state.level ?? 'focused'
  const levelSec = snap?.levelSec ?? 0

  // Aviso sonoro quando a distração dura mais que alguns segundos.
  useEffect(() => {
    if (!sound || snap?.phase !== 'running') return
    if ((level === 'distracted' || level === 'lost') && levelSec > ALERT_AFTER_SEC) {
      const now = Date.now()
      if (now - lastChime.current > ALERT_GAP_MS) {
        lastChime.current = now
        chime()
      }
    }
  }, [sound, snap?.phase, level, levelSec])

  const paused = snap?.phase === 'paused'
  const calibrating = status !== 'live' || snap?.phase === 'calibrating'

  const togglePause = useCallback(() => {
    const e = engineRef.current
    if (!e) return
    if (paused) e.resume()
    else e.pause()
  }, [paused])

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.code === 'Space' && ev.target === document.body) {
        ev.preventDefault()
        togglePause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePause])

  const end = () => {
    const e = engineRef.current
    pip.close()
    if (e) onEnd(e.summary())
    else onCancel()
  }

  if (status === 'error' && error) {
    const msg = { camera: t.errorCamera, noCamera: t.errorNoCamera, model: t.errorModel }[error]
    return (
      <section className="session session-error">
        <p className="error-msg" role="alert">
          {msg}
        </p>
        <div className="row">
          <button className="btn btn-primary" onClick={() => {
              setError(null)
              setStatus('camera')
              setAttempt((n) => n + 1)
            }}>
            {t.tryAgain}
          </button>
          <button className="btn" onClick={onCancel}>
            {t.back}
          </button>
        </div>
      </section>
    )
  }

  const score = Math.round(snap?.state.score ?? 0)
  const levelName = t.levels[level].name

  return (
    <section className={`session ${calibrating ? 'is-calibrating' : 'is-live'}`}>
      <div className="stage">
        {calibrating ? (
          <div className="calibration" aria-live="polite">
            <h2 className="calibration-title">
              {status === 'camera' ? t.askingCamera : status === 'model' ? t.loadingModel : t.calibrating}
            </h2>
            {status === 'live' && <p className="muted">{t.calibratingHint}</p>}
            <div className="progress" aria-hidden="true">
              <motion.div
                className="progress-fill"
                animate={{ scaleX: snap?.calibrationProgress ?? 0 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        ) : (
          <div className="readout" aria-live="polite">
            <FocusFace level={level} score={score} size={300} label={levelName} />
            <h2 className="level-name" style={{ color: LEVEL_BY_ID[level].color }}>
              {levelName}
            </h2>
            <p className="reason">{paused ? t.paused : t.reasons[snap!.state.reason]}</p>
            <p className="score">
              {t.focusScore} <strong>{score}</strong>
            </p>
          </div>
        )}
      </div>

      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        className={`camera ${calibrating ? 'camera-big' : 'camera-small'} ${showCamera || calibrating ? '' : 'camera-hidden'}`}
      >
        <video ref={videoRef} playsInline muted aria-hidden="true" />
      </motion.div>

      {!calibrating && (
        <div className="controls">
          <button className="btn" onClick={togglePause} aria-pressed={paused}>
            {paused ? t.resume : t.pause}
          </button>
          <button className="btn" onClick={() => engineRef.current?.recalibrate()}>
            {t.recalibrate}
          </button>
          {pipSupported() ? (
            <button className="btn" onClick={pip.win ? pip.close : pip.open} aria-pressed={!!pip.win}>
              {pip.win ? t.floatClose : t.float}
            </button>
          ) : (
            <span className="muted small">{t.floatUnsupported}</span>
          )}
          <label className="toggle">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => {
                setSound(e.target.checked)
                if (e.target.checked) unlockAudio()
              }}
            />
            {t.sound}
          </label>
          <label className="toggle">
            <input type="checkbox" checked={showCamera} onChange={(e) => setShowCamera(e.target.checked)} />
            {t.showCamera}
          </label>
          <button className="btn btn-end" onClick={end}>
            {t.end}
          </button>
        </div>
      )}
      {calibrating && (
        <div className="controls">
          <button className="btn" onClick={onCancel}>
            {t.back}
          </button>
        </div>
      )}

      <PipPortal win={pip.win}>
        <div className="pip">
          <FocusFace level={level} score={score} size={170} label={levelName} />
          <p className="pip-label" style={{ color: LEVEL_BY_ID[level].color }}>
            {paused ? t.pause : levelName}
          </p>
        </div>
      </PipPortal>
    </section>
  )
}
