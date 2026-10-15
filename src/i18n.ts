import type { LevelId } from './attention/levels'
import type { Reason } from './attention/scorer'

export type Lang = 'pt' | 'en'

interface Strings {
  appName: string
  tagline: string
  homeTitle: string
  homeLead: string
  howTitle: string
  howSteps: string[]
  start: string
  privacy: string
  levels: Record<LevelId, { name: string; hint: string }>
  reasons: Record<Reason, string>
  history: string
  noHistory: string
  loadingModel: string
  askingCamera: string
  calibrating: string
  calibratingHint: string
  paused: string
  pause: string
  resume: string
  recalibrate: string
  float: string
  floatClose: string
  floatUnsupported: string
  sound: string
  showCamera: string
  hideCamera: string
  end: string
  focusScore: string
  errorCamera: string
  errorNoCamera: string
  errorModel: string
  tryAgain: string
  back: string
  reportTitle: string
  duration: string
  average: string
  distractions: string
  longestFocus: string
  timeInEach: string
  timeline: string
  newSession: string
  goHome: string
  tipGreat: string
  tipOk: string
  tipLow: string
  minutes: (s: number) => string
}

const pt: Strings = {
  appName: 'FocusMoji',
  tagline: 'Transformando distração em atenção, um emoji de cada vez.',
  homeTitle: 'Quanto você está prestando atenção agora?',
  homeLead:
    'Deixe o FocusMoji aberto ao lado da aula online. Ele olha pela câmera se você está ligado na aula e mostra um emoji que muda junto com o seu foco.',
  howTitle: 'Como funciona',
  howSteps: [
    'Ligue a câmera e olhe para a tela da aula por alguns segundos.',
    'Assista à aula normalmente. O emoji muda se você olhar para o lado, fechar os olhos ou sair da frente da câmera.',
    'No fim, veja o relatório com o seu foco minuto a minuto.',
  ],
  start: 'Ligar câmera e começar',
  privacy: 'O vídeo é analisado só neste computador. Nenhuma imagem é gravada ou enviada para a internet.',
  levels: {
    focused: { name: 'Focado', hint: 'Olhando para a aula' },
    drifting: { name: 'Perdendo o foco', hint: 'Cansaço ou distração leve' },
    distracted: { name: 'Distraído', hint: 'Atenção em outro lugar' },
    lost: { name: 'Desligado', hint: 'Longe da aula' },
  },
  reasons: {
    focused: 'Você está ligado na aula',
    noFace: 'Não estou vendo você na câmera',
    eyesClosed: 'Seus olhos estão fechando',
    headTurned: 'Sua cabeça está virada para outro lado',
    lookingAway: 'Seu olhar saiu da tela',
    yawning: 'Parece que bateu um sono',
  },
  history: 'Últimas sessões',
  noHistory: 'Suas sessões vão aparecer aqui.',
  loadingModel: 'Preparando o detector de atenção…',
  askingCamera: 'Permita o acesso à câmera no aviso do navegador.',
  calibrating: 'Olhe para a tela da aula',
  calibratingHint: 'Estou aprendendo como você fica quando está prestando atenção.',
  paused: 'Pausado. A nota não muda enquanto estiver pausado.',
  pause: 'Pausar',
  resume: 'Continuar',
  recalibrate: 'Calibrar de novo',
  float: 'Emoji flutuante',
  floatClose: 'Fechar emoji flutuante',
  floatUnsupported: 'O emoji flutuante funciona no Chrome e no Edge.',
  sound: 'Aviso sonoro',
  showCamera: 'Mostrar câmera',
  hideCamera: 'Esconder câmera',
  end: 'Encerrar sessão',
  focusScore: 'Nota de foco',
  errorCamera:
    'O navegador bloqueou a câmera. Clique no ícone de câmera na barra de endereço, permita o acesso e tente de novo.',
  errorNoCamera: 'Nenhuma câmera foi encontrada. Conecte uma câmera e tente de novo.',
  errorModel: 'O detector de atenção não carregou. Verifique a internet e tente de novo.',
  tryAgain: 'Tentar de novo',
  back: 'Voltar',
  reportTitle: 'Relatório da sessão',
  duration: 'Duração',
  average: 'Foco médio',
  distractions: 'Distrações',
  longestFocus: 'Maior tempo focado',
  timeInEach: 'Tempo em cada emoji',
  timeline: 'Foco ao longo da sessão',
  newSession: 'Começar outra sessão',
  goHome: 'Voltar ao início',
  tipGreat: 'Foco excelente! Você ficou ligado na maior parte da aula.',
  tipOk: 'Foi bem, mas teve momentos de distração. Tente deixar o celular longe.',
  tipLow: 'A atenção escapou bastante. Que tal pausas curtas a cada 20 minutos?',
  minutes: (s) => (s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`),
}

const en: Strings = {
  appName: 'FocusMoji',
  tagline: 'Turning distraction into engagement, one emoji at a time.',
  homeTitle: 'How focused are you right now?',
  homeLead:
    'Keep FocusMoji open next to your online class. It uses your camera to check whether you are following the class and shows an emoji that changes with your focus.',
  howTitle: 'How it works',
  howSteps: [
    'Turn on your camera and look at the class screen for a few seconds.',
    'Watch the class as usual. The emoji changes if you look away, close your eyes or leave the camera.',
    'At the end, see a report of your focus minute by minute.',
  ],
  start: 'Turn on camera and start',
  privacy: 'Video is analyzed only on this computer. No image is recorded or sent to the internet.',
  levels: {
    focused: { name: 'Focused', hint: 'Watching the class' },
    drifting: { name: 'Drifting', hint: 'Tired or slightly distracted' },
    distracted: { name: 'Distracted', hint: 'Attention somewhere else' },
    lost: { name: 'Checked out', hint: 'Far from the class' },
  },
  reasons: {
    focused: 'You are following the class',
    noFace: "I can't see you on camera",
    eyesClosed: 'Your eyes are closing',
    headTurned: 'Your head is turned away',
    lookingAway: 'Your eyes left the screen',
    yawning: 'Looks like you are getting sleepy',
  },
  history: 'Recent sessions',
  noHistory: 'Your sessions will show up here.',
  loadingModel: 'Getting the attention detector ready…',
  askingCamera: 'Allow camera access in the browser prompt.',
  calibrating: 'Look at the class screen',
  calibratingHint: 'I am learning what you look like when you are paying attention.',
  paused: 'Paused. Your score does not change while paused.',
  pause: 'Pause',
  resume: 'Resume',
  recalibrate: 'Calibrate again',
  float: 'Floating emoji',
  floatClose: 'Close floating emoji',
  floatUnsupported: 'The floating emoji works in Chrome and Edge.',
  sound: 'Sound alert',
  showCamera: 'Show camera',
  hideCamera: 'Hide camera',
  end: 'End session',
  focusScore: 'Focus score',
  errorCamera:
    'The browser blocked the camera. Click the camera icon in the address bar, allow access and try again.',
  errorNoCamera: 'No camera was found. Connect a camera and try again.',
  errorModel: 'The attention detector did not load. Check your internet connection and try again.',
  tryAgain: 'Try again',
  back: 'Back',
  reportTitle: 'Session report',
  duration: 'Duration',
  average: 'Average focus',
  distractions: 'Distractions',
  longestFocus: 'Longest focus streak',
  timeInEach: 'Time on each emoji',
  timeline: 'Focus over the session',
  newSession: 'Start another session',
  goHome: 'Back to start',
  tipGreat: 'Great focus! You followed most of the class.',
  tipOk: 'Good job, with a few distracted moments. Try keeping your phone away.',
  tipLow: 'Your attention slipped a lot. How about short breaks every 20 minutes?',
  minutes: (s) => (s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`),
}

export const STRINGS: Record<Lang, Strings> = { pt, en }

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem('focusmoji.lang')
    if (saved === 'pt' || saved === 'en') return saved
  } catch {
    /* sem armazenamento: usa o idioma do navegador */
  }
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem('focusmoji.lang', lang)
  } catch {
    /* ignore */
  }
}
