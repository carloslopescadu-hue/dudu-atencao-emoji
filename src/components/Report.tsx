import type { SessionSummary } from '../attention/engine'
import { LEVELS, levelFor } from '../attention/levels'
import type { STRINGS } from '../i18n'

interface Props {
  t: (typeof STRINGS)['pt']
  summary: SessionSummary
  onNew: () => void
  onHome: () => void
}

export function Report({ t, summary, onNew, onHome }: Props) {
  const avg = Math.round(summary.avgScore)
  const avgLevel = LEVELS.find((l) => l.id === levelFor(avg))!
  const total = Math.max(summary.durationSec, 1)
  const tip = avg >= 72 ? t.tipGreat : avg >= 48 ? t.tipOk : t.tipLow

  return (
    <section className="report">
      <header className="report-head">
        <span className="report-emoji" aria-hidden="true">
          {avgLevel.emoji}
        </span>
        <div>
          <h1>{t.reportTitle}</h1>
          <p className="muted">
            {new Date(summary.startedAt).toLocaleString()} — {tip}
          </p>
        </div>
      </header>

      <dl className="stats">
        <div>
          <dt>{t.average}</dt>
          <dd style={{ color: avgLevel.color }}>{avg}</dd>
        </div>
        <div>
          <dt>{t.duration}</dt>
          <dd>{t.minutes(summary.durationSec)}</dd>
        </div>
        <div>
          <dt>{t.distractions}</dt>
          <dd>{summary.distractions}</dd>
        </div>
        <div>
          <dt>{t.longestFocus}</dt>
          <dd>{t.minutes(summary.longestFocusSec)}</dd>
        </div>
      </dl>

      <h2>{t.timeInEach}</h2>
      <ul className="bars">
        {LEVELS.map((l) => {
          const sec = summary.levelSeconds[l.id]
          const pct = (sec / total) * 100
          return (
            <li key={l.id}>
              <span className="bars-emoji" aria-hidden="true">
                {l.emoji}
              </span>
              <span className="bars-name">{t.levels[l.id].name}</span>
              <span className="bars-track">
                <span className="bars-fill" style={{ width: `${pct}%`, background: l.color }} />
              </span>
              <span className="bars-value">
                {Math.round(pct)}% · {t.minutes(sec)}
              </span>
            </li>
          )
        })}
      </ul>

      <h2>{t.timeline}</h2>
      <Timeline values={summary.timeline} label={t.timeline} />

      <div className="row">
        <button className="btn btn-primary" onClick={onNew}>
          {t.newSession}
        </button>
        <button className="btn" onClick={onHome}>
          {t.goHome}
        </button>
      </div>
    </section>
  )
}

function Timeline({ values, label }: { values: number[]; label: string }) {
  const W = 800
  const H = 200
  const n = values.length
  if (n < 2) return <p className="muted">—</p>

  // Agrupa em no máximo 400 pontos para sessões longas.
  const step = Math.max(1, Math.ceil(n / 400))
  const pts: number[] = []
  for (let i = 0; i < n; i += step) {
    const slice = values.slice(i, i + step)
    pts.push(slice.reduce((a, b) => a + b, 0) / slice.length)
  }
  const x = (i: number) => (i / (pts.length - 1)) * W
  const y = (v: number) => H - (v / 100) * H
  const line = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const minutes = Math.floor(n / 60)
  const ticks = minutes > 0 ? Array.from({ length: Math.min(minutes, 10) + 1 }, (_, i) => Math.round((i * minutes) / Math.min(minutes, 10))) : []

  return (
    <svg className="timeline" viewBox={`0 -8 ${W} ${H + 36}`} role="img" aria-label={label}>
      {LEVELS.map((l, i) => {
        const top = i === 0 ? 100 : LEVELS[i - 1].min
        return (
          <rect key={l.id} x={0} y={y(top)} width={W} height={y(l.min) - y(top)} fill={l.color} opacity={0.08} />
        )
      })}
      {LEVELS.slice(0, 3).map((l) => (
        <text key={l.id} x={W - 4} y={y(l.min) - 4} textAnchor="end" className="timeline-emoji">
          {l.emoji}
        </text>
      ))}
      <path d={`${line} L${W} ${H} L0 ${H} Z`} fill="url(#tl-fill)" />
      <path d={line} fill="none" stroke="#E9D8A0" strokeWidth={2.5} strokeLinejoin="round" />
      <defs>
        <linearGradient id="tl-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9D8A0" stopOpacity="0.35" />
          <stop offset="1" stopColor="#E9D8A0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((m) => (
        <text key={m} x={(m * 60 * W) / (n - 1)} y={H + 24} textAnchor="middle" className="timeline-tick">
          {m} min
        </text>
      ))}
    </svg>
  )
}
