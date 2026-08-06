# Contributing to SP Night

SP Night is a colour scheme first and a website second. The two most valuable
contributions are **a new port** and **a colour problem report** — both are
explained in full at [sp-night.github.io/contribute](https://sp-night.github.io/contribute).
This file is the short version.

## Adding a port

A port is **a mapping**, not a copy of the colours: which of your app's config
keys means which role. The colour decisions are already made in the
[spec](https://sp-night.github.io/spec), and the palette and role layer are
published as data —
[`/palette.json`](https://sp-night.github.io/palette.json) and
[`/roles.json`](https://sp-night.github.io/roles.json).

1. Open the spec and find the roles your app needs — a terminal wants the
   sixteen `ansi` roles, an editor wants `syntax`, a status bar mostly wants `ui`.
2. Take your own config file and replace each colour with the role that means it.
3. **Never reach into the palette.** Ask for a role, not a colour. A mapping
   that names `sodio` directly breaks the moment a flavour is added or a colour
   is retuned, and it silently disagrees with every other port.
4. Resolve the mapping into one finished file per flavour. How you produce them
   is your business — no tool is required, and none is blessed.
5. Check anything your app composes that the palette does not already cover:
   text on an accent, a badge, a tooltip over glass. Those pairs should hold
   4.5:1.
6. A port lands as its own `sp-night/<slug>` repository, with a README, real
   install instructions and a preview of the actual app. The preview is what
   convinces someone to install a theme — that is the bar.

If your app needs a role the layer does not have yet, that is a real finding —
open an issue.

Once the repo exists, add one entry to the catalogue in
[`sp-night/sp-night`](https://github.com/sp-night/sp-night) at
`registry/ports.yml` — **not** in this repository, which vendors a copy that the
next sync overwrites. Merging that entry opens a pull request here, and merging
*that* publishes the port's own page at `/ports/<slug>`: install instructions,
the key-to-role table and a preview, all generated from the entry.

So the entry is worth filling in properly. `install_guide` is the one field
nothing can derive — it is where an app's particular awkwardness gets explained,
like Ghostty's theme files having no extension. Entries without a published
`repo:` are rejected by the tests: nothing is listed before it can be installed.

## Reporting a colour problem

A contrast bug is the most valuable issue you can file and the easiest to act
on. Include the two colours, where they meet, and the ratio if you measured it:

> `fg_muted` on `vidro` in the eza header row, 3.02:1, unreadable on my monitor.

Judgement calls are welcome too — the `jaragua` flavour was rebuilt because its
surfaces read as dark green rather than black, and that started as somebody
simply not enjoying looking at it.

## Working on the website

This repository is the site: a static [Astro](https://astro.build) build with
no UI framework. Colour data is vendored in `src/data/` and flows through one
typed module — no component reads the JSON directly, and **no hex literal
exists outside `src/data/`** (a test scans the tree).

```sh
npm ci
npm run dev        # dev server
npm run check      # astro type-check
npm test           # colour maths, data shape, contrast policy, no-raw-hex rule
npm run build      # static build into dist/
npm run assets     # regenerate favicons, logos, OG cards, palette strips
```

`npm run check && npm test` must pass before a PR — the contrast policy is part
of the tests, so a change that breaks it never deploys. If you touch the
palette, run `npm run assets` and commit the regenerated images: every image in
the README and every icon on the site derives from `src/data/palette.json`.
