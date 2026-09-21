# SP Night — o site

O site do tema: apresenta a paleta, publica o contrato (`/palette.json`, `/roles.json`) e
diz como instalar cada port. Astro estático, conteúdo em inglês, nomes de cores e flavors em
português. As cores são definitivas — o site mostra a paleta, não a edita.

Este arquivo descreve **como o site está hoje** e as regras que ele segue. O porquê de cada
mudança está na mensagem do commit que a fez.

## Rodar

| comando | o que faz |
|---|---|
| `npm run dev` | servidor local em `localhost:4321`, com a rota `/kit` |
| `npm run build && npm run preview` | o build de produção, como será publicado |
| `npm run check` | `astro check` — tipos e templates |
| `npm test` | vitest; o CI roda `check`, `test` e `build` em todo push e PR |
| `npm run assets` | regera cards OG, favicons, logos, faixas da paleta e as tabelas do README |
| `npm run contributors` | atualiza `src/data/contributors.json` (o CI faz toda segunda) |

## Onde fica cada coisa

```
src/data/        o contrato vendorizado e os módulos que o leem
  palette.json, roles.json, contrast.json, ports.yml, copy.yml   ← copiados do motor; não editar
  palette.ts     cores, derivações, contraste, floorFor(), flavorStylesheet()
  content.ts     texto editorial: glosas, manchetes do hero, sceneAccent, preview da home
  ports.ts, preview.ts, guide.ts   catálogo de ports, previews sintéticos, guias de instalação
src/components/  Skyline (as três cenas), FlavorSwitcher, ColorCard, TerminalMock, Wire, Logo…
src/pages/       home, palette, spec, ports (+ uma página por port), contribute, 404, [kit]
src/scripts/     copy.ts (copiar hex/snippet), motion.ts (parallax, reveal, pausa da cena, índice)
src/lib/mark.mjs a marca — usada pelo Logo e pelo gerador de assets
scripts/         gen-assets.mjs, fonts.mjs, gen-contributors.mjs
tests/           guardas do contrato, dos ports, do README e do próprio site
```

## Regras

**Dados**
- O contrato é a fonte. Os arquivos vindos do motor são sobrescritos pelo sync — corrigir lá.
- **Zero hex fora de `src/data`.** Toda cor é `var(--sp-*)`, gerada por `flavorStylesheet()`
  (`tests/no-raw-hex.test.ts` cobra).
- Nada é afirmado se pode ser derivado: contagens, pisos de contraste e tabelas saem dos dados.
- O site lista só ports publicados; cada página de port é gerada do catálogo.

**Flavors**
- `data-flavor` no `<html>` escolhe o bloco de variáveis. Texto que muda por flavor é
  renderizado uma vez por flavor e escondido com `data-f`; texto que só acende usa `data-lit`.
- `sceneAccent` (`content.ts`) é a cor de cada cena: vira `--sp-glow`, a segunda metade da
  bolinha do switcher e a linha acesa dos cards OG.
- Cada flavor tem sua cena no hero: a cidade à noite, a Roda Rico na garoa, o Pico do Jaraguá.

**Design**
- **Sódio tem dois trabalhos: ação e foco.** Estado ("você está aqui") é `--sp-glow`.
  Informação é `marginal`, aviso é `brasa`; rótulos e números são cores de texto.
- Um hover só: 2 px para cima, borda de `fiacao` para `fg-muted`. Só o botão primário projeta luz.
- Tokens: raios `--r-xs/s/m/pill`, espaço `--space-1…6`, `--pad-card`, `--pad-tight`.
- Tipo: Bricolage Grotesque (texto e títulos) e JetBrains Mono (código e rótulos), auto-hospedadas.
- Texto corrido até `--measure` (52ch). Páginas longas usam duas colunas com índice fixo.
- `/kit` mostra cada primitivo uma vez — conferir ali antes de mudar um componente. Só existe
  em `astro dev`.

**Movimento**
- Pequeno e lento. Tudo colapsa em `prefers-reduced-motion`, inclusive os atrasos.
- A cena do hero pausa fora da tela. A troca de flavor usa View Transitions onde houver.
- JS mínimo, sem framework: switcher, copiar, relógio, `motion.ts`.

**Assets**
- `npm run assets` desenha os cards com as fontes do site: `scripts/fonts.mjs` converte os
  woff2 do fontsource para TTF e isola o fontconfig, então o card sai igual em qualquer máquina.
- `npm test` falha quando a tabela do README está desatualizada.

## Histórico

| rodada | data | o que mudou |
|---|---|---|
| 1 | 2026-08-02 | scaffold Astro, dados vendorizados, switcher, palette, spec, hero com skyline |
| 2 | 2026-08-02 | jaragua repintado; o site passa a listar só o que existe; `/contribute` |
| 3 | 2026-08-02 | revisão visual em navegador; reduced-motion zera os atrasos |
| 4 | 2026-08-02 | a marca: o Pico do Jaraguá com a torre, desenhado a partir de fotos |
| 5 | 2026-08-02 | a Roda Rico no garoa; o contrato passa a ser público e o motor, substituível |
| 6 | 2026-08-06 | catálogo inteiro vendorizado, páginas por port, crédito coletivo |
| 7 | 2026-09-20 | movimento por flavor e a troca de flavor como cena |
| 8 | 2026-09-21 | tipografia própria; o hero vira uma vista, com manchete por flavor |
| 9 | 2026-09-21 | paleta como galeria, duas colunas, fiação, consistência de cor/hover/raio, testes |
| 10 | 2026-09-21 | cards OG com as fontes e manchetes do site; reveal por scroll só com CSS |

## Pendências

- **Verificar em Chrome real:** a troca de flavor por View Transitions e o reveal por
  `animation-timeline` só foram vistos no Firefox headless (o reveal com a flag ligada).
- **Lighthouse e teclado:** nunca rodados num navegador de verdade.
- **Flavors escritos à mão:** as cenas do skyline e alguns seletores de estado ainda citam
  `noite`/`garoa`/`jaragua`. Um quarto flavor no contrato exige editar esses pontos.
