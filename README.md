# FocusMoji 😄 😔 😵‍💫 🤮

> "Turning distraction into engagement, one emoji at a time."

Projeto do Dudu: um app que usa a câmera para perceber se o aluno está prestando
atenção na aula online e mostra um emoji que muda conforme o foco.

| Emoji | Estado | Quando aparece |
|---|---|---|
| 😄 | Focado | Olhando para a tela da aula |
| 😔 | Perdendo o foco | Bocejando ou olhando para fora por pouco tempo |
| 😵‍💫 | Distraído | Olhar ou cabeça virados para outro lado por vários segundos |
| 🤮 | Desligado | Olhos fechados ou fora da câmera |

## Como funciona

1. **Câmera → MediaPipe Face Landmarker** (Google). Roda dentro do navegador:
   nenhuma imagem é gravada nem enviada para a internet.
2. **Sinais** (`src/attention/signals.ts`): rosto presente, rotação da cabeça,
   olhos fechando, direção do olhar e bocejo.
3. **Calibração**: nos primeiros segundos o app aprende como o aluno fica quando
   está olhando para a aula (a câmera pode estar em cima, do lado etc.).
4. **Nota de foco 0–100** (`src/attention/scorer.ts`): cada condição precisa
   durar um tempinho para contar (piscar não conta) e a nota anda suave.
5. **Emoji** (`src/attention/levels.ts`): a nota vira um dos quatro emojis.
6. **Relatório**: foco médio, tempo em cada emoji, distrações e gráfico.

Extras: emoji flutuante por cima do Zoom/Meet (Chrome e Edge), aviso sonoro,
pausa (barra de espaço) e interface em português e inglês.

## Rodar no computador

Precisa do Node 22 (`nvm use`).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (ex.: http://localhost:5173) no Chrome.

## Publicar

Todo `git push` na branch `main` publica o site no GitHub Pages
(`.github/workflows/deploy.yml`).

## Ideias para as próximas versões

- Painel do professor com a turma toda (cada aluno manda só a nota, nunca o vídeo).
- Extensão do Chrome que mostra o emoji dentro do Google Meet.
- Ajustar os limites (`THRESHOLDS` em `scorer.ts`) com testes de verdade em aula.
- Detectar celular na mão.

A apresentação original está em `docs/apresentacao/`.
