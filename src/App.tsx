import { useEffect, useState } from 'react'
import type { SessionSummary } from './attention/engine'
import { Backdrop } from './components/Backdrop'
import { Home } from './components/Home'
import { Report } from './components/Report'
import { Session } from './components/Session'
import { loadHistory, saveSession } from './history'
import { detectLang, saveLang, STRINGS, type Lang } from './i18n'

type Screen = { name: 'home' } | { name: 'session' } | { name: 'report'; summary: SessionSummary }

// Sessões com menos de 10 s (testes rápidos) não vão para o histórico.
const MIN_SAVED_SEC = 10

export default function App() {
  const [lang, setLang] = useState<Lang>(detectLang)
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [history, setHistory] = useState(loadHistory)
  const t = STRINGS[lang]

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }, [lang])

  const switchLang = (l: Lang) => {
    setLang(l)
    saveLang(l)
  }

  return (
    <>
      <Backdrop />
      <div className="app">
        <header className="topbar">
          <button className="brand" onClick={() => setScreen({ name: 'home' })} disabled={screen.name === 'session'}>
            <span aria-hidden="true">😄</span> {t.appName}
          </button>
          <div className="lang" role="group" aria-label="Idioma / Language">
            {(['pt', 'en'] as const).map((l) => (
              <button key={l} aria-pressed={lang === l} onClick={() => switchLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <main>
          {screen.name === 'home' && (
            <Home
              t={t}
              history={history}
              onStart={() => setScreen({ name: 'session' })}
              onOpen={(summary) => setScreen({ name: 'report', summary })}
            />
          )}
          {screen.name === 'session' && (
            <Session
              t={t}
              onCancel={() => setScreen({ name: 'home' })}
              onEnd={(summary) => {
                if (summary.durationSec >= MIN_SAVED_SEC) setHistory(saveSession(summary))
                setScreen({ name: 'report', summary })
              }}
            />
          )}
          {screen.name === 'report' && (
            <Report
              t={t}
              summary={screen.summary}
              onNew={() => setScreen({ name: 'session' })}
              onHome={() => setScreen({ name: 'home' })}
            />
          )}
        </main>

        <footer className="footer">{t.tagline}</footer>
      </div>
    </>
  )
}
