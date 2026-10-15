import { motion, useReducedMotion } from 'motion/react'
import type { SessionSummary } from '../attention/engine'
import { LEVELS, levelFor, LEVEL_BY_ID } from '../attention/levels'
import type { STRINGS } from '../i18n'

interface Props {
  t: (typeof STRINGS)['pt']
  history: SessionSummary[]
  onStart: () => void
  onOpen: (s: SessionSummary) => void
}

export function Home({ t, history, onStart, onOpen }: Props) {
  const reduce = useReducedMotion()

  return (
    <section className="home">
      <div className="hero">
        <h1 className="hero-title">{t.homeTitle}</h1>
        <p className="lead">{t.homeLead}</p>
        <button className="btn btn-primary btn-big" onClick={onStart}>
          {t.start}
        </button>
        <p className="privacy">{t.privacy}</p>
      </div>

      <ol className="scale" aria-label={t.howTitle}>
        {LEVELS.map((l, i) => (
          <motion.li
            key={l.id}
            initial={reduce ? false : { opacity: 0, y: 40, rotate: -15 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.15 + i * 0.12, type: 'spring', stiffness: 260, damping: 16 }}
          >
            <span className="scale-emoji" aria-hidden="true">
              {l.emoji}
            </span>
            <span className="scale-name" style={{ color: l.color }}>
              {t.levels[l.id].name}
            </span>
            <span className="scale-hint">{t.levels[l.id].hint}</span>
          </motion.li>
        ))}
      </ol>

      <div className="home-cols">
        <div>
          <h2>{t.howTitle}</h2>
          <ol className="steps">
            {t.howSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
        <div>
          <h2>{t.history}</h2>
          {history.length === 0 ? (
            <p className="muted">{t.noHistory}</p>
          ) : (
            <ul className="history">
              {history.map((s) => {
                const lvl = LEVEL_BY_ID[levelFor(s.avgScore)]
                return (
                  <li key={s.id}>
                    <button className="history-item" onClick={() => onOpen(s)}>
                      <span aria-hidden="true">{lvl.emoji}</span>
                      <span>{new Date(s.startedAt).toLocaleDateString()}</span>
                      <span className="muted">{t.minutes(s.durationSec)}</span>
                      <strong style={{ color: lvl.color }}>{Math.round(s.avgScore)}</strong>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
