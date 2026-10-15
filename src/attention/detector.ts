import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// Os arquivos do MediaPipe ficam dentro do próprio app (pasta public/),
// então nada sai do computador e o app funciona mesmo sem acesso a CDNs.
const asset = (path: string) => new URL(`${import.meta.env.BASE_URL}${path}`, location.href).href

let landmarkerPromise: Promise<FaceLandmarker> | null = null

async function create(): Promise<FaceLandmarker> {
  const fileset = await FilesetResolver.forVisionTasks(asset('mediapipe/wasm'))
  const options = (delegate: 'GPU' | 'CPU') => ({
    baseOptions: { modelAssetPath: asset('models/face_landmarker.task'), delegate },
    runningMode: 'VIDEO' as const,
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  })
  try {
    return await FaceLandmarker.createFromOptions(fileset, options('GPU'))
  } catch {
    // Alguns computadores não liberam a GPU para o navegador.
    return FaceLandmarker.createFromOptions(fileset, options('CPU'))
  }
}

/** Carrega o detector uma vez só e reaproveita nas próximas sessões. */
export function getLandmarker(): Promise<FaceLandmarker> {
  landmarkerPromise ??= create().catch((err) => {
    landmarkerPromise = null
    throw err
  })
  return landmarkerPromise
}
