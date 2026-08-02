<p align="center">
  <a href="https://sp-night.github.io">
    <img src="public/logo-noite.svg" width="120" alt="SP Night — the Pico do Jaraguá at dusk, aviation beacon lit, the city's lights at the foot of the range">
  </a>
</p>

<h1 align="center">SP Night</h1>

<p align="center">
  <strong>The sodium lamp turns the whole city this colour.</strong><br>
  A dark colour scheme with São Paulo as its reference — the sodium street lamp,<br>
  exposed concrete, the free span of the MASP, the drizzle before the rain.
</p>

<p align="center">
  <a href="https://github.com/sp-night/sp-night.github.io/actions/workflows/deploy.yml"><img src="https://github.com/sp-night/sp-night.github.io/actions/workflows/deploy.yml/badge.svg" alt="Deploy to GitHub Pages"></a>
  <img src="https://img.shields.io/badge/flavours-3-f2984a" alt="3 flavours">
  <img src="https://img.shields.io/badge/colours-22-f2984a" alt="22 colours">
  <img src="https://img.shields.io/badge/license-MIT-2e3040" alt="MIT license">
</p>

<p align="center">
  <a href="https://sp-night.github.io"><strong>sp-night.github.io</strong></a>
  &nbsp;·&nbsp;
  <a href="https://sp-night.github.io/palette">palette</a>
  &nbsp;·&nbsp;
  <a href="https://sp-night.github.io/spec">spec</a>
  &nbsp;·&nbsp;
  <a href="https://sp-night.github.io/contribute">contribute</a>
</p>

---

## The flavours

All three are dark, by decision. They differ in hue and chroma, never in brightness —
nothing gets easier or harder to read when you switch.

<table>
  <tr>
    <td align="center" width="33%"><img src="public/logo-noite.svg" width="88" alt="Noite Paulista mark"></td>
    <td align="center" width="33%"><img src="public/logo-garoa.svg" width="88" alt="Garoa mark"></td>
    <td align="center" width="33%"><img src="public/logo-jaragua.svg" width="88" alt="Pico do Jaraguá mark"></td>
  </tr>
  <tr>
    <td align="center"><strong>Noite Paulista</strong> <code>noite</code></td>
    <td align="center"><strong>Garoa</strong> <code>garoa</code></td>
    <td align="center"><strong>Pico do Jaraguá</strong> <code>jaragua</code></td>
  </tr>
  <tr>
    <td align="center">The city at 3&nbsp;a.m. A blue-violet dark, with the sodium street lamp burning warm on top of it.</td>
    <td align="center">The same window, seen through the drizzle. Flat grey — the garoa does not cool the city down, it fades it out.</td>
    <td align="center">The same night, seen from the highest point in the city. Near-black, the forest left to the accents.</td>
  </tr>
</table>

## The palette

Five surfaces · three levels of text · eight accents · six bright pairs — 22 colours,
each named after the thing in São Paulo it came from. Every pairing is measured before
it ships, never eyeballed.

**noite**
<img src="public/palette-noite.svg" width="100%" alt="The 22 colours of noite, grouped: surfaces, text, accents, bright pairs">

**garoa**
<img src="public/palette-garoa.svg" width="100%" alt="The 22 colours of garoa, grouped: surfaces, text, accents, bright pairs">

**jaragua**
<img src="public/palette-jaragua.svg" width="100%" alt="The 22 colours of jaragua, grouped: surfaces, text, accents, bright pairs">

Full detail — glosses, OKLCH, WCAG ratios, the ANSI map — lives at
[sp-night.github.io/palette](https://sp-night.github.io/palette).

## This repository

The website. A static [Astro](https://astro.build) site, no UI framework. Colour data
is vendored in `src/data/` and flows through one typed module, `src/data/palette.ts`:

- **No component reads the JSON directly** — everything derives at build time.
- **No hex literal exists outside `src/data/`** — enforced by a test that scans the tree.
- The contrast policy (body text AAA on every surface, dim text AA, accents AA on the
  deepest background) is asserted in CI, so a palette drop that breaks it never deploys.

```sh
npm ci
npm run dev        # dev server
npm run check      # astro type-check
npm test           # vitest: colour maths, data shape, contrast policy, no-raw-hex rule
npm run build      # static build into dist/
npm run assets     # regenerate favicons, logos, OG cards and palette strips
```

Every image in this README is generated from the palette by `npm run assets` —
if the colours change, the brand follows.

## Deploy

Push to `main` → `deploy.yml` runs type-check, tests and build, then publishes to
GitHub Pages. Other branches and PRs run the same checks via `ci.yml` without deploying.

## Updating the palette · adding ports

- Palette or roles change → replace `src/data/palette.json` / `src/data/roles.json`,
  run `npm test` (the contrast tests are the gate) and `npm run assets`.
- Per-app themes (ports) will be linked from the site as they are published —
  metadata for the 17 targets lives in `src/data/ports.ts`.

See [`SITE.md`](SITE.md) for the full design plan and decision log.

<p align="center">
  <sub>SP Night — built by Rogerio Junior · MIT</sub>
</p>
