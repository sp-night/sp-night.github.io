# Contributing to SP Night

SP Night is a colour scheme first and a website second. The two most valuable
contributions are **a new port** and **a colour problem report** — both are
explained in full at [sp-night.github.io/contribute](https://sp-night.github.io/contribute).
This file is the short version.

## Adding a port

A port is **one template file**, not a copy of the colours: a template with
holes in it that the generator fills once per flavour. The colour decisions are
already made in the [spec](https://sp-night.github.io/spec).

1. Open the spec and find the roles your app needs — a terminal wants the
   sixteen `ansi` roles, an editor wants `syntax`, a status bar mostly wants `ui`.
2. Take your own config file and replace each colour with the role that means it.
3. **Never reach into the palette.** Ask for a role, not a colour. A template
   that hardcodes `sodio` breaks the moment a flavour is added or a colour is
   retuned.
4. Run the checks: the generator audits contrast for every pair and reruns the
   build to confirm nothing is stale.
5. A port lands with a README, a screenshot of the real app, install
   instructions and a code sample worth looking at. The screenshot is what
   convinces someone to install a theme — that is the bar.

The [17 planned targets](https://sp-night.github.io/ports) show what is covered;
if your app needs a role the layer does not have yet, that is a real finding —
open an issue.

## Reporting a colour problem

A contrast bug is the most valuable issue you can file and the easiest to act
on. Include the two colours, where they meet, and the ratio if you measured it:

> `fg_muted` on `vidro` in the Waybar tooltip, 3.02:1, unreadable on my monitor.

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
