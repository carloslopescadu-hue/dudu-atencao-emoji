import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface DocumentPictureInPicture {
  requestWindow(opts: { width: number; height: number }): Promise<Window>
}

const pipApi = (): DocumentPictureInPicture | undefined =>
  (window as unknown as { documentPictureInPicture?: DocumentPictureInPicture }).documentPictureInPicture

export const pipSupported = () => !!pipApi()

/**
 * Abre uma janelinha que fica por cima de todas as outras (inclusive do Zoom/Meet),
 * usando a Document Picture-in-Picture API do Chrome/Edge.
 */
export function usePip() {
  const [win, setWin] = useState<Window | null>(null)

  const open = useCallback(async () => {
    const api = pipApi()
    if (!api) return
    const w = await api.requestWindow({ width: 220, height: 260 })
    // A janelinha nasce em about:blank; o <base> faz as fontes do app carregarem.
    const base = w.document.createElement('base')
    base.href = location.href
    w.document.head.appendChild(base)
    // Copia os estilos do app para a janelinha.
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const style = w.document.createElement('style')
        style.textContent = Array.from(sheet.cssRules)
          .map((r) => r.cssText)
          .join('\n')
        w.document.head.appendChild(style)
      } catch {
        if (sheet.href) {
          const link = w.document.createElement('link')
          link.rel = 'stylesheet'
          link.href = sheet.href
          w.document.head.appendChild(link)
        }
      }
    }
    w.document.body.className = 'pip-body'
    w.addEventListener('pagehide', () => setWin(null), { once: true })
    setWin(w)
  }, [])

  const close = useCallback(() => {
    win?.close()
    setWin(null)
  }, [win])

  useEffect(() => () => win?.close(), [win])

  return { win, open, close }
}

export function PipPortal({ win, children }: { win: Window | null; children: ReactNode }) {
  if (!win) return null
  return createPortal(children, win.document.body)
}
