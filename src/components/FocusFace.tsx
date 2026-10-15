import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition } from 'motion/react'
import { LEVEL_BY_ID, type LevelId } from '../attention/levels'

// Cada emoji tem o seu "jeito" de se mexer, para dar para sentir o estado de longe.
const IDLE: Record<LevelId, TargetAndTransition> = {
  focused: { y: [0, -8, 0], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  drifting: {
    y: [0, 5, 0],
    rotate: [0, -5, 0],
    transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
  },
  distracted: { rotate: [-12, 12, -12], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } },
  lost: { x: [-3, 3, -3], transition: { duration: 0.45, repeat: Infinity, ease: 'easeInOut' } },
}

interface Props {
  level: LevelId
  score: number
  size?: number
  label?: string
}

export function FocusFace({ level, score, size = 280, label }: Props) {
  const reduce = useReducedMotion()
  const { emoji, color } = LEVEL_BY_ID[level]
  const stroke = Math.max(6, size * 0.035)
  const r = size / 2 - stroke
  const circumference = 2 * Math.PI * r

  return (
    <div className="face" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg className="face-ring" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className="face-track" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference * (1 - score / 100), stroke: color }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={level}
          className="face-emoji"
          style={{ fontSize: size * 0.5 }}
          initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.3, rotate: 25, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        >
          <motion.span className="face-emoji-inner" animate={reduce ? undefined : IDLE[level]}>
            {emoji}
          </motion.span>
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
