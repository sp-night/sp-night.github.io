# SP Night — site

The website for **SP Night**, a dark colour scheme with São Paulo as its
reference: the sodium street lamp, exposed concrete, the free span of the MASP,
the drizzle before the rain. Three flavours (`noite`, `garoa`, `jaragua`),
22 colours, generated targets for 17 apps.

Live at **<https://sp-night.github.io>** — deployed automatically from `main`
by GitHub Actions.

## Stack

Static [Astro](https://astro.build) site, MDX integration installed, no UI
framework. All colour data lives in `src/data/` (vendored palette + roles JSON)
and flows through one typed module, `src/data/palette.ts` — no component reads
the JSON directly and **no hex literal exists outside `src/data/`** (enforced
by a test).

## Development

```sh
npm ci
npm run dev        # dev server
npm run check      # astro type-check
npm test           # vitest: palette maths, data shape, contrast policy, no-raw-hex rule
npm run build      # static build into dist/
npm run assets     # regenerate favicons / logos / OG images from the palette
```

## Deploy

Every push to `main` runs `deploy.yml`: type-check → tests → build → publish to
GitHub Pages. Pushes to other branches and PRs run the same checks via `ci.yml`
without deploying.

## Updating the palette or adding ports

- Palette / roles change → replace `src/data/palette.json` / `src/data/roles.json`,
  then `npm test` (the contrast-policy tests are the gate) and `npm run assets`.
- Per-app themes (ports) will link from here as they are published — port
  metadata lives in `src/data/ports.ts`.

See `SITE.md` for the full design plan and decision log.
