let ctx: AudioContext | null = null

/** Um "plim" suave de duas notas para lembrar de voltar para a aula. */
export function chime() {
  ctx ??= new AudioContext()
  const now = ctx.currentTime
  for (const [i, freq] of [660, 880].entries()) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = now + i * 0.18
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.12, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.65)
  }
}

/** O navegador só libera áudio depois de um clique; chame isto num clique. */
export function unlockAudio() {
  ctx ??= new AudioContext()
  void ctx.resume()
}
