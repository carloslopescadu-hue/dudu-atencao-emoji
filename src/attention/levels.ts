export type LevelId = 'focused' | 'drifting' | 'distracted' | 'lost'

export interface Level {
  id: LevelId
  emoji: string
  /** Pontuação mínima (0–100) para entrar neste nível. */
  min: number
  color: string
}

// Os quatro emojis da apresentação do Dudu, do mais focado ao mais desligado.
export const LEVELS: Level[] = [
  { id: 'focused', emoji: '😄', min: 72, color: '#7DF0B4' },
  { id: 'drifting', emoji: '😔', min: 48, color: '#A9C8FF' },
  { id: 'distracted', emoji: '😵‍💫', min: 24, color: '#FFC46B' },
  { id: 'lost', emoji: '🤮', min: 0, color: '#FF7FA0' },
]

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l])) as Record<LevelId, Level>

/** Margem para o emoji não ficar trocando quando a nota fica perto do limite. */
const HYSTERESIS = 4

export function levelFor(score: number, current?: LevelId): LevelId {
  const plain = LEVELS.find((l) => score >= l.min)!.id
  if (!current || plain === current) return plain

  const cur = LEVEL_BY_ID[current]
  const idx = LEVELS.indexOf(cur)
  const upperBound = idx > 0 ? LEVELS[idx - 1].min : Infinity
  // Só sai do nível atual quando passa do limite com folga.
  if (score >= cur.min - HYSTERESIS && score < upperBound + HYSTERESIS) return current
  return plain
}
