# SP Night — Plano do site

> Escopo desta fase: **montar o site localmente neste repo**, como teste.
> Sem deploy, sem renomear repo, sem `/lab` interativo.
> Conteúdo em **inglês**; nomes de cores e flavors permanecem em português (identidade).
> Cores são **definitivas** — o site apresenta a paleta, não a edita.

---

## 1. Decisões

| # | Decisão | Nota |
|---|---|---|
| S1 | **Astro + MDX**, estático | content collections resolvem as 17 páginas de port |
| S2 | Sem config de deploy | `astro.config.mjs` mínimo; `site`/`base` entram quando houver URL definida |
| S3 | Paleta **vendorizada** em `src/data/` | o pacote `@sp-night/palette` ainda não existe; um único ponto de troca no futuro |
| S4 | **Zero hex** no código do site | tudo deriva do JSON → CSS custom properties |
| S5 | **Sem `/lab`** | cores definitivas; contraste é calculado em *build time*, não no navegador |
| S6 | Idioma: inglês | glosas das cores exibidas em EN, com o original PT como legenda |
| S7 | JS mínimo | só o flavor switcher, o click-to-copy e o relógio do hero. Sem framework UI |
| S8 | Ports sem screenshot real | preview sintético (mock de terminal em CSS/SVG pintado pela paleta) |

## 2. Rotas

```
/                 Hero: skyline SVG + relógio SP · HH:MM + flavor switcher + pitch
/palette          As 22 cores × 3 flavors, agrupadas, click-to-copy, glosa + contraste
/ports            Galeria dos 17 alvos, filtro por grupo
/ports/[slug]     Instalação por app (17 páginas MDX)
/spec             As regras de design (STYLE.md do lab, reescrito em inglês)
```

## 3. Estrutura de arquivos

```
sp-night-theme/
├── astro.config.mjs          integrations: [mdx]
├── package.json              deps: astro, @astrojs/mdx  (só isso)
├── tsconfig.json
├── src/
│   ├── data/
│   │   ├── palette.json      ← cópia de palette/sp_night.json do lab
│   │   ├── roles.json        ← cópia de palette/roles.json do lab
│   │   ├── ports.ts          metadados dos 17 alvos (grupo, nome, docs URL, path do dist)
│   │   └── palette.ts        MÓDULO DE DADOS (§4) — tipos + derivações + contraste
│   ├── layouts/
│   │   └── Base.astro        <head> (meta/OG/favicon), script anti-flash, header, footer
│   ├── components/
│   │   ├── FlavorSwitcher.astro
│   │   ├── Skyline.astro     SVG migrado do demo (linhas 588–807)
│   │   ├── HeroClock.astro   relógio SP · HH:MM
│   │   ├── ColorCard.astro   swatch + nome + hex + glosa + ratio (click-to-copy)
│   │   ├── PortCard.astro
│   │   ├── TerminalMock.astro  preview sintético pintado pela paleta
│   │   └── CodeBlock.astro   snippet com botão copiar
│   ├── pages/
│   │   ├── index.astro
│   │   ├── palette.astro
│   │   ├── spec.astro
│   │   └── ports/
│   │       ├── index.astro
│   │       └── [...slug].astro
│   ├── content/
│   │   ├── config.ts         schema da collection `ports`
│   │   └── ports/*.mdx       17 arquivos (kitty, alacritty, ghostty, herdr, nvim,
│   │                          tmux, fish, starship, bat, eza, waybar, hyprland,
│   │                          gtk, kde, noctalia, css, json)
│   ├── scripts/
│   │   └── flavor.ts         switcher (localStorage + data-flavor)
│   └── styles/
│       └── global.css        reset + tipografia + tokens NÃO-cor
└── public/
    └── favicon.svg
```

## 4. Módulo de dados (`src/data/palette.ts`)

Fonte única no site. Lê os dois JSONs e exporta, **tudo em build time**:

- `flavors: Flavor[]` — `{ id, label, description, colors: Record<Key, Color> }`
- `Color` — `{ key, hex, rgb, hsl, oklch, group, meaning: {pt, en}, isAccent, vivoOf? }`
  `rgb`/`hsl`/`oklch` **derivados** do hex por funções locais (porte da matemática do `tools/gen/color.go`)
- `groups` — `surfaces` (vao, laje, concreto, vidro, fiacao) · `text` (fg, fg_dim, fg_muted) · `accents` (8) · `vivo` (6)
- `roles` — resolvido: `ui/syntax/diagnostic/git/ansi` → hex, por flavor
- `contrast(a, b)` e, por cor, os ratios WCAG contra `vao`/`laje`/`concreto` (exibidos em `/palette`)
- `cssVars(flavor)` — gera o bloco `--sp-<key>: <hex>` de um flavor

**Regra:** nenhum componente lê JSON direto nem escreve hex; tudo passa por este módulo.

## 5. Mecanismo do flavor switcher

1. `Base.astro` emite, em build time, um `<style>` com um bloco por flavor:
   ```
   :root[data-flavor="noite"]   { --sp-vao:#0f101a; … }
   :root[data-flavor="garoa"]   { … }
   :root[data-flavor="jaragua"] { … }
   ```
   (gerado por `cssVars()` — nenhum hex escrito à mão)
2. Todo CSS do site usa só `var(--sp-*)`.
3. Script inline no `<head>` (antes do paint) lê `localStorage.spNightFlavor` e seta `data-flavor` — sem flash.
4. `FlavorSwitcher.astro` = 3 botões (`role="radiogroup"`, navegação por setas) que trocam o atributo e persistem.
5. Default: **noite**. Deep link `?flavor=` respeitado no boot.

## 6. Migração do demo (só o hero)

| Origem (`demo/index.html`) | Destino |
|---|---|
| SVG `#skyline`, linhas 588–807 (estrelas, garoa-chuva, cena-cidade, copan, masp, pico-jaragua) | `Skyline.astro` — copiado como está; já usa `var(--sp-*)` |
| Gerador procedural de prédios (`#buildings`, ~linhas 1302–1400) | pré-renderizado em **build time** no `Skyline.astro` (seed fixa) → vira SVG estático, zero JS |
| Relógio `SP · HH:MM` | `HeroClock.astro`, ~10 linhas de JS |
| Haze/atmosfera | valor fixo (0.18, o default do demo) — sem slider |
| Matemática de cor JS (contrast/oklab/CVD) | **não migra para o cliente**; vira TS de build em `palette.ts` (só contraste; CVD sai de escopo) |
| Tabs de preview, paleta editável, matriz de contraste | **fora de escopo** (sem `/lab`) |

## 7. Ports — dados, não MDX (revisão da implementação)

> Decisão tomada durante o M4: as 17 páginas de port são geradas a partir de
> `src/data/ports.ts` + `[slug].astro`, **não** de 17 arquivos MDX.
> Motivo: todo o conteúdo atual (grupo, blurb, path do dist, path de instalação,
> linha de ativação, nota) é estruturado — em MDX viraria duplicação com o
> `manifest.json`. A integração MDX fica instalada para quando um port precisar
> de prosa longa (o `kde` é o candidato: a cadeia Qt/GTK/kdeglobals).

### Schema original (mantido para referência)

Schema (`src/content/config.ts`): `title`, `slug`, `group` (`terminal`|`editor`|`shell`|`desktop`|`web`), `description`, `docsUrl`, `distPath` (`dist/{flavor}/<target>/<file>`), `note?` (as notas do `manifest.json` para herdr/kde/noctalia), `order`.

Corpo MDX = instruções de instalação (base: os snippets do README do lab + os headers dos arquivos em `dist/`). A página `[...slug].astro` renderiza: título, mock de preview, seletor de flavor herdado do global, bloco de instalação com o path correto do flavor ativo, e o link para o arquivo gerado.

## 8. Acessibilidade e `<head>` (o demo não tem)

- `role`/`aria-*` no switcher e nos filtros; foco visível; ordem de tabulação sã
- Botões de copiar com `aria-label` e feedback via `aria-live`
- `<meta name="description">`, OG/Twitter tags, `favicon.svg`, `lang="en"`
- `prefers-reduced-motion` respeitado (o demo já fazia isso no CSS — manter)

## 9. Milestones

| M | Entrega | Status |
|---|---|---|
| **M1** | Scaffold Astro + MDX, `src/data/` vendorizado, `palette.ts`, `Base.astro`, tokens CSS por flavor, switcher | ✅ |
| **M2** | `/palette` completa (grupos, glosa, OKLCH, ratios, click-to-copy, mapa ANSI) | ✅ |
| **M3** | Home: skyline pré-renderizado + relógio + fatos + strip da paleta + índice de ports | ✅ |
| **M4** | `/ports` com filtro + 17 páginas `[slug]` + `TerminalMock` + `CodeBlock` | ✅ |
| **M5** | `/spec` em inglês (3 camadas, tabelas, política de contraste, separação de acentos, gates de CI) | ✅ |
| **M6** | Polimento: a11y, meta/OG, favicon, responsivo | ✅ base feita — falta revisão visual |

**Rodada 2 — jaragua v2, site honesto, docs contribuíveis** (2026-08-02)

| entrega | status |
|---|---|
| `jaragua` repintado: superfícies preto com sopro de verde (croma 0.025 → 0.009), texto neutralizado | ✅ auditado pelo gerador: 70 pares/flavor, 0 falhas |
| `/ports` removido — o site não dá instrução de instalação enquanto o arquivo não existir | ✅ |
| Nav: `palette · spec · contribute` | ✅ |
| Home: passe de honestidade (fatos, lede, CTA) + bloco de status | ✅ |
| `/spec` reescrita: resumo simples, exemplo trabalhado role→saída, glossário, TOC | ✅ |
| `/contribute` nova: 6 passos, template lado a lado, o que falta cobrir | ✅ |
| `src/data/content.ts`: conteúdo editorial separado do dado de cor | ✅ estrutura pronta |
| `astro check` no fluxo | ✅ 0 erros / 0 avisos / 0 hints em 19 arquivos |
| Imagem OG + favicon por flavor, gerados da paleta (`npm run assets`) | ✅ |

**Rodada 3 — revisão visual real** (2026-08-02)

Feita com Firefox headless (`--screenshot`) contra o dev server, nos 3 flavors, desktop (1280px) e
mobile (390px). Bugs encontrados e corrigidos:

| bug | correção |
|---|---|
| **`prefers-reduced-motion` não zerava os *delays***: com `both` fill e `--d: 470ms`, o hero ficava sem título/lede/botões por meio segundo — e invisível para qualquer captura ou preview social | `animation-delay`/`transition-delay: 0ms !important` no bloco reduced-motion + `.rise { animation: none }` |
| Título do hero com `max-width: 16ch` quebrava "turns the whole city" em duas linhas e criava um vão morto | `max-width: 23ch`, padding-top do hero reduzido |
| Rótulos ANSI longos (`temporal_vivo`, `marginal_vivo`) vazavam do card | `flex-wrap` + coluna de 15.5rem + `overflow-wrap` |
| Header mobile: "SP Night" quebrava em 2 linhas, "Pico do Jaraguá" também | `white-space: nowrap` + nav em linha própria abaixo de 34rem |
| Switcher colapsado no mobile mostrava 3 bolinhas **idênticas** (o swatch usa `sodio`, igual em noite e jaragua) | mostra o id curto (`noite`/`garoa`/`jaragua`) no lugar do nome completo |
| Skyline achatava para ~80px no mobile | `min-height: 160px` abaixo de 40rem |
| Índice da `/spec` lia como parágrafo, não como navegação | virou chips com borda |
| Faixa morta acima do rodapé (4rem somados ao padding da seção) | `margin-top: 1.5rem` |

**Rodada 4 — a marca** (2026-08-02)

O favicon antigo era uma lâmpada genérica, sem relação com o pico. A marca nova é o
**Pico do Jaraguá ao anoitecer**: o cume em silhueta contra o horizonte de sódio, o farol de
aviação da torre no topo, e as luzes de São Paulo no sopé da serra — a cidade que se olha de lá.

Chegamos nela por 5 rodadas de exploração renderizada (28 variantes, avaliadas em 240px e em
tamanho de favicon). O que cada rodada ensinou: farol grande demais vira balão flutuando; picos
simétricos liam como clip-art de trilha; e — o mais importante — **o pico real foi pesquisado antes
do desenho final**.

**A geometria veio da pesquisa e depois de fotos reais.** A pesquisa deu os números: o maciço tem
dois cumes de altura quase igual — Jaraguá (1.135 m) e Pico do Papagaio (1.127 m) — separados por
uma reentrância, descrito como um "pequeno serrote", com encostas **arredondadas** de Mata
Atlântica e um conjunto de torres de rádio e TV no cume.

**As fotos corrigiram o essencial:** a protagonista não é a montanha, é a **torre**. Um mastro
treliçado altíssimo e esguio, listrado de vermelho e branco, mais alto que a parte visível do morro,
com parabólicas ao longo do corpo, um prédio branco na base e o farol de aviação no topo. É ela que
faz a silhueta ser reconhecível de meia cidade — o morro é o pedestal.

Isso mudou marca e hero:

- morro arredondado e íngreme (bezier), cume vizinho mais baixo com mastro próprio
- **torre dominante listrada** ocupando quase metade da altura da marca, farol no topo
- serra ao fundo esmaecida, luzes de São Paulo no sopé
- no hero: treliça com travessas em X, parabólicas, prédio na base, estais e mastro listrado

Efeito colateral bom: a verticalidade da torre **sobrevive melhor aos 16px** do que a silhueta
anterior — o traço vertical claro com o ponto vermelho continua legível onde só o morro virava
borrão.

| arquivo | papel |
|---|---|
| `src/components/Logo.astro` | marca inline com `var(--sp-*)` — **retinge junto com o flavor switcher** |
| `public/favicon-<flavor>.svg` | mesma marca com os hexes assados, trocada por JS conforme o flavor |
| `public/logo-<flavor>.svg` | versão 256px para README e material |
| card OG | passou a exibir a marca no lugar do círculo laranja |
| `Skyline.astro` (`#pico-jaragua`) | a cena do hero ganhou a mesma geometria: dois cumes, sela, crista arredondada |

Verificada em 256 / 64 / 48 / 32 / 16px nos três flavors. Aos 16px vira uma silhueta escura sobre
faixa quente — ainda lê como montanha, mas é o limite; se um dia precisar, vale uma variante
simplificada só para esse tamanho.

**Rodada 5 — a Roda Rico no garoa** (2026-08-02)

Cada flavor passa a ter a sua vista. O `garoa` sai do centro e vai para o **Parque Villa-Lobos**:
a Roda Rico girando na garoa, com a Marginal Pinheiros passando aos seus pés.

Pesquisa antes do desenho, mais as fotos de referência:

- **91 m, 42 cabines**, cada uma para 8 pessoas
- projetada pelo escritório **SPWM — o mesmo do London Eye**, e é isso que explica o desenho:
  roda de bicicleta com cabos finos em vez de treliça pesada, cabines por fora do aro
- fica no Parque Cândido Portinari, colado ao Villa-Lobos, na Marginal Pinheiros
- **nunca para**: 3–5 km/h, uma volta completa em ~25 minutos

A animação segue esse espírito: 100 s por volta, lenta o bastante para você só perceber que ela
andou se olhar de novo. **Cada uma das 42 cabines contra-gira na mesma taxa**, para ficar nivelada
como as de verdade — a soma das duas rotações dá zero.

| elemento | nota |
|---|---|
| aro duplo + 42 cabos, um terço deles mais claro | como aparece iluminada à noite |
| pernas abertas + coluna central | estrutura das fotos |
| pavilhão iluminado na base, com o letreiro vermelho | o prédio do embarque |
| Alto de Pinheiros ao fundo, achatado pela garoa | janelas acesas esparsas |
| copa do parque no primeiro plano | 1 em cada 4 árvores puxa levemente para o `ibira` |
| brilho de sódio reduzido (`--sp-haze: 0.06`) | o garoa é cinza chapado, não quente |

**A iluminação noturna** (segunda passada, a partir das fotos): à noite a roda não é uma estrutura
escura — ela é fonte de luz, e o que domina são os **raios acesos como barras de LED**, não os cabos
finos do dia.

- raios em `temporal`, com comprimentos alternados e parando antes do cubo e do aro — o starburst
  das fotos, não uma teia uniforme
- cada raio tem miolo brilhante sobre um traço grosso e translúcido: o *bloom* sem custo de filtro
- aro externo aceso, cabines com lâmpadas variando entre `temporal`, `sereno` e `marginal`, e uma
  luz vermelha a cada sete cabines
- coluna central lavada de roxo, como nas fotos
- **halo radial** em volta da roda: a garoa espalha a luz — é o encontro dos dois elementos da cena
- um *chase* de 9 s percorre os raios, junto com a respiração do halo

Verificação da rotação, já que screenshot estático não mostra movimento: renderizei a roda com o
giro assado em 0° / 40° / 95° (cabines seguem no aro e continuam niveladas) e depois um teste em
Firefox com `animation-delay: -25s`, que força a animação a 90° no carregamento — confirmando que
o navegador executa `transform-box: view-box` + contra-rotação corretamente.

**Pendências conhecidas:**
- **Textos dos flavors — aguardando o autor.** `content.ts` está com `todo: true` nos três flavors;
  `tagline` e `whenToUse` são placeholders. A `story` do jaragua em PT ainda descreve as superfícies
  verdes que não existem mais.
- Decidir se os verdes do jaragua devem se afastar mais dos do noite (hoje 5 dos 8 acentos são idênticos)
- Revisão visual/responsiva em navegador
- Trocar `src/data/*.json` pelo pacote `@sp-night/palette` quando existir

**Verificação final:** `npm run build` sem erros/avisos, todas as rotas geradas, zero hex fora de `src/data/`
(`grep -rE "#[0-9a-fA-F]{6}" src --exclude-dir=data` deve vir vazio).
