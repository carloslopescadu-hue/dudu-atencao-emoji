import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision'

/** O que conseguimos ler do rosto em um quadro da câmera. */
export interface FrameSignals {
  face: boolean
  /** Rotação da cabeça em graus. */
  yaw: number
  pitch: number
  /** 0 = olhos abertos, 1 = fechados. */
  eyesClosed: number
  /** Direção do olhar: horizontal (-1..1) e vertical (positivo = para baixo). */
  gazeH: number
  gazeV: number
  /** Boca aberta (bocejo), 0..1. */
  jawOpen: number
}

export const NO_FACE: FrameSignals = {
  face: false,
  yaw: 0,
  pitch: 0,
  eyesClosed: 0,
  gazeH: 0,
  gazeV: 0,
  jawOpen: 0,
}

const DEG = 180 / Math.PI

export function extractSignals(result: FaceLandmarkerResult): FrameSignals {
  if (!result.faceLandmarks.length) return NO_FACE

  const shapes = new Map<string, number>()
  for (const c of result.faceBlendshapes?.[0]?.categories ?? []) shapes.set(c.categoryName, c.score)
  const b = (name: string) => shapes.get(name) ?? 0

  let yaw = 0
  let pitch = 0
  const m = result.facialTransformationMatrixes?.[0]?.data
  if (m) {
    // Matriz 4x4 em column-major: r(linha, coluna) = m[coluna * 4 + linha]
    const r = (row: number, col: number) => m[col * 4 + row]
    pitch = Math.atan2(r(2, 1), r(2, 2)) * DEG
    yaw = Math.atan2(-r(2, 0), Math.hypot(r(2, 1), r(2, 2))) * DEG
  }

  return {
    face: true,
    yaw,
    pitch,
    eyesClosed: (b('eyeBlinkLeft') + b('eyeBlinkRight')) / 2,
    gazeH: (b('eyeLookOutLeft') + b('eyeLookInRight') - b('eyeLookInLeft') - b('eyeLookOutRight')) / 2,
    gazeV:
      (b('eyeLookDownLeft') + b('eyeLookDownRight') - b('eyeLookUpLeft') - b('eyeLookUpRight')) / 2,
    jawOpen: b('jawOpen'),
  }
}
