/**
 * Generates the static image assets from the palette, so they can never drift
 * from the theme: one Open Graph card and one favicon per flavour.
 *
 *   node scripts/gen-assets.mjs
 *
 * Outputs into public/: og-<flavor>.png (1200x630), favicon-<flavor>.svg,
 * logo-<flavor>.svg, palette-<flavor>.svg, the touch/PWA icons with
 * site.webmanifest, and the hex + ports tables kept between markers in
 * README.md. Re-run whenever the palette or src/data/ports.yml changes.
 * Every colour below is read from src/data/palette.json — no hex is written
 * by hand.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { markSvg } from '../src/lib/mark.mjs';
import { parse as parseYaml } from 'yaml';
import { useProjectFonts } from './fonts.mjs';
// The headline and the scene accent are the site's own, read from the module
// the home page renders — not retyped here. Node strips the types.
import { heroLines, sceneAccent } from '../src/data/content.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Before sharp loads: the cards are set in the site's faces (scripts/fonts.mjs).
await useProjectFonts(root);
const { default: sharp } = await import('sharp');

const DISPLAY = 'SP Display';
const MONO = 'SP Mono';
const palette = JSON.parse(readFileSync(join(root, 'src/data/palette.json'), 'utf8'));

/* The bands come from the contract, the same way src/data/palette.ts reads
   them. They used to be four hand-written lists here, and when `fg_vivo` was
   added to the text band every image this script draws — the palette strips,
   the OG cards — and the README's hex table dropped it without a word. A
   generator that has its own idea of what the palette contains is a second
   source of truth wearing a script's clothes. */
const band = (id) => palette.groups[id].keys;
const SURFACES = band('surfaces');
const TEXT = band('text');
const ACCENTS = band('accents');
const VIVO = band('vivo');

/** Fixed-seed PRNG — the OG skyline must be identical on every run. */
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function skyline(c) {
  const rand = mulberry32(1958);
  const FLOOR = 630;
  const towers = [
    [0, 96, 150], [104, 84, 220], [196, 118, 118], [322, 88, 250], [418, 136, 96],
    [562, 78, 186], [648, 114, 268], [770, 96, 132], [874, 96, 172], [978, 80, 228],
    [1066, 142, 110],
  ];
  let out = '';
  for (const [x, w, h] of towers) {
    const top = FLOOR - h;
    out += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${c.concreto}"/>`;
    out += `<rect x="${x}" y="${top}" width="${w}" height="4" fill="${c.vao}" opacity="0.45"/>`;
    const cols = Math.max(1, Math.floor((w - 12) / 26));
    const rows = Math.max(1, Math.floor((h - 20) / 34));
    for (let i = 0; i < cols; i++) {
      const bias = 0.2 + rand() * 0.45;
      for (let j = 0; j < rows; j++) {
        if (rand() > bias) continue;
        const lit = [c.sodio, c.sodio, c.taxi, c.sereno, c.fg_muted][Math.floor(rand() * 5)];
        out += `<rect x="${x + 9 + i * 26}" y="${top + 15 + j * 34}" width="11" height="15" fill="${lit}" opacity="${(0.4 + rand() * 0.5).toFixed(2)}"/>`;
      }
    }
  }
  return out;
}

/** The mark's contents only, so it can be nested inside another svg. */
function markInline(flavor) {
  return markSvg(flavor)
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>$/, '')
    .replace(/id="sky"/, 'id="mark-sky"')
    .replace(/url\(#sky\)/, 'url(#mark-sky)')
    .replace(/id="beacon"/, 'id="mark-beacon"')
    .replace(/url\(#beacon\)/, 'url(#mark-beacon)');
}

/** The scene's accent for a flavour — the hero's lit line, and its lamp. */
const litFor = (id, c) => c[sceneAccent[id]] ?? c.sodio;

function ogSvg(id, flavor) {
  const c = flavor.colors;
  const lit = litFor(id, c);
  // Same three lines as the hero of the home page, for the same flavour.
  const lines = heroLines[id];
  if (!lines) throw new Error(`no hero headline for flavour "${id}" in src/data/content.ts`);
  const swatches = ACCENTS.map(
    (k, i) => `<rect x="${72 + i * 52}" y="470" width="40" height="40" rx="8" fill="${c[k]}"/>`,
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.vao}"/>
      <stop offset="0.72" stop-color="${c.vao}"/>
      <stop offset="1" stop-color="${c.laje}"/>
    </linearGradient>
    <radialGradient id="lamp" cx="0.5" cy="0.1" r="0.75">
      <stop offset="0" stop-color="${lit}" stop-opacity="0.26"/>
      <stop offset="0.55" stop-color="${lit}" stop-opacity="0.05"/>
      <stop offset="1" stop-color="${lit}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect width="1200" height="630" fill="url(#lamp)"/>
  <g opacity="0.5">${skyline(c)}</g>
  <rect x="0" y="626" width="1200" height="4" fill="${c.vao}"/>

  <g transform="translate(72 76) scale(0.72)">${markInline(flavor)}</g>
  <text x="132" y="114" font-family="${MONO}" font-size="30" font-weight="700" fill="${c.fg}">SP Night</text>

  ${lines
    .map(
      (line, i) =>
        `<text x="72" y="${214 + i * 74}" font-family="${DISPLAY}" font-size="70" font-weight="700" letter-spacing="-2" fill="${i === 1 ? lit : c.fg}">${esc(line)}</text>`,
    )
    .join('\n  ')}

  <text x="72" y="424" font-family="${DISPLAY}" font-size="28" fill="${c.fg_dim}">A dark theme with São Paulo as its reference — ${esc(flavor.label)}</text>

  ${swatches}
</svg>`;
}

/**
 * The social card for one port group's page.
 *
 * Same scene as the site card, so a shared link is recognisably the same
 * project — the headline is the only thing that changes. One card per group in
 * the default flavour, because a page emits exactly one og:image and three
 * would be two dead files each. The line under the headline names the ports
 * the page holds, which is what someone deciding whether to click wants.
 */
function groupOgSvg(flavorId, flavor, label, names) {
  const c = flavor.colors;
  const lit = litFor(flavorId, c);
  const swatches = ACCENTS.map(
    (k, i) => `<rect x="${72 + i * 52}" y="470" width="40" height="40" rx="8" fill="${c[k]}"/>`,
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.vao}"/>
      <stop offset="0.72" stop-color="${c.vao}"/>
      <stop offset="1" stop-color="${c.laje}"/>
    </linearGradient>
    <radialGradient id="lamp" cx="0.5" cy="0.1" r="0.75">
      <stop offset="0" stop-color="${lit}" stop-opacity="0.26"/>
      <stop offset="0.55" stop-color="${lit}" stop-opacity="0.05"/>
      <stop offset="1" stop-color="${lit}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect width="1200" height="630" fill="url(#lamp)"/>
  <g opacity="0.5">${skyline(c)}</g>
  <rect x="0" y="626" width="1200" height="4" fill="${c.vao}"/>

  <g transform="translate(72 76) scale(0.72)">${markInline(flavor)}</g>
  <text x="132" y="114" font-family="${MONO}" font-size="30" font-weight="700" fill="${c.fg}">SP Night</text>

  <text x="72" y="268" font-family="${DISPLAY}" font-size="76" font-weight="700" letter-spacing="-2" fill="${c.fg}">SP Night for</text>
  <text x="72" y="352" font-family="${DISPLAY}" font-size="76" font-weight="700" letter-spacing="-2" fill="${lit}">${esc(label)}</text>

  <text x="72" y="414" font-family="${MONO}" font-size="26" fill="${c.fg_dim}">${esc(names.join(' · '))}</text>

  ${swatches}
</svg>`;
}

/** SVG text is XML: a port name or path with an ampersand would break the card. */
const esc = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/** All 22 colours in palette order as one group-spaced strip — the README's
    palette preview. Swatches sit on the flavour's own background. */
function stripSvg(flavor) {
  const c = flavor.colors;
  const SW = 30;
  const GAP = 4;
  const GROUP_GAP = 16;
  const PAD = 10;
  let x = PAD;
  let cells = '';
  for (const group of [SURFACES, TEXT, ACCENTS, VIVO]) {
    for (const key of group) {
      cells += `<rect x="${x}" y="${PAD}" width="${SW}" height="${SW}" rx="7" fill="${c[key]}"/>`;
      x += SW + GAP;
    }
    x += GROUP_GAP - GAP;
  }
  const w = x - GROUP_GAP + PAD;
  const h = SW + PAD * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="12" fill="${c.vao}"/>
  <rect width="${w}" height="${h}" rx="12" fill="none" stroke="${c.fiacao}"/>
  ${cells}
</svg>`;
}

for (const [id, flavor] of Object.entries(palette.flavors)) {
  const svg = ogSvg(id, flavor);
  await sharp(Buffer.from(svg)).png().toFile(join(root, `public/og-${id}.png`));
  writeFileSync(join(root, `public/favicon-${id}.svg`), markSvg(flavor, 64, true));
  writeFileSync(join(root, `public/logo-${id}.svg`), markSvg(flavor, 256));
  writeFileSync(join(root, `public/palette-${id}.svg`), stripSvg(flavor));
  console.log(`og-${id}.png + favicon-${id}.svg + logo-${id}.svg + palette-${id}.svg`);
}

// The default favicon mirrors the default flavour.
writeFileSync(join(root, 'public/favicon.svg'), markSvg(palette.flavors.noite, 64, true));
console.log('favicon.svg (noite)');

/* Touch and PWA icons mirror the default flavour, flattened onto vao — the
   platforms mask their own corners, so no transparency survives anyway. */
function flatIconSvg(flavor, size) {
  return markSvg(flavor, size).replace(
    '<defs>',
    `<rect width="64" height="64" fill="${flavor.colors.vao}"/><defs>`,
  );
}

const noite = palette.flavors.noite;
for (const [file, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  await sharp(Buffer.from(flatIconSvg(noite, size))).png().toFile(join(root, `public/${file}`));
  console.log(file);
}

writeFileSync(
  join(root, 'public/site.webmanifest'),
  JSON.stringify(
    {
      name: palette.label,
      short_name: palette.label,
      start_url: '/',
      display: 'browser',
      background_color: noite.colors.vao,
      theme_color: noite.colors.vao,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('site.webmanifest');

/* The README tables live between markers and are rewritten here, so the
   published values can never drift from the palette or the port registry. */
const readmePath = join(root, 'README.md');

function replaceReadmeBlock(marker, body) {
  const readme = readFileSync(readmePath, 'utf8');
  const START = `<!-- ${marker}:start -->`;
  const END = `<!-- ${marker}:end -->`;
  if (!readme.includes(START) || !readme.includes(END)) return;
  const start = readme.indexOf(START);
  const end = readme.indexOf(END) + END.length;
  writeFileSync(
    readmePath,
    readme.slice(0, start) + [START, body, END].join('\n') + readme.slice(end),
  );
  console.log(`README.md ${marker}`);
}

const FLAVOR_IDS = Object.keys(palette.flavors);
const KEYS = [...SURFACES, ...TEXT, ...ACCENTS, ...VIVO];

function hexTable() {
  const header = `| colour | ${FLAVOR_IDS.map((id) => `\`${id}\``).join(' | ')} |`;
  const rule = `| --- | ${FLAVOR_IDS.map(() => '---').join(' | ')} |`;
  const rows = KEYS.map(
    (key) =>
      `| \`${key}\` | ${FLAVOR_IDS.map((id) => `\`${palette.flavors[id].colors[key]}\``).join(' | ')} |`,
  );
  return [header, rule, ...rows].join('\n');
}

replaceReadmeBlock(
  'palette-table',
  [
    '<details>',
    `<summary>The ${KEYS.length} hex values, all three flavours</summary>`,
    '',
    hexTable(),
    '',
    '</details>',
  ].join('\n'),
);

/* A second parse of the catalogue, independent of src/data/ports.ts. It cannot
   import that module: the loader reads its YAML through Vite's `?raw`, which
   plain Node does not resolve. Only four fields are read here, and the README
   table this feeds is asserted against the catalogue by tests/readme.test.ts —
   so the duplication cannot drift silently even though it is duplication. */
const registry = parseYaml(readFileSync(join(root, 'src/data/ports.yml'), 'utf8'));

/* Every port in the registry is published, so there is no status to report —
   the useful columns are where to get it and where the file goes. */
function portsTable() {
  const rows = registry.ports.map(
    (p) => `| [${p.name}](${p.repo}) | ${registry.groups[p.group]} | \`${p.install}\` |`,
  );
  return ['| Port | Group | Installs to |', '| --- | --- | --- |', ...rows].join('\n');
}

replaceReadmeBlock('ports-table', portsTable());

/* One social card per group page, in the order a port first calls for the
   group — the rule src/data/ports.ts uses for the pages themselves. The
   default flavour only: a page emits one og:image, so three would be two dead
   files each. */
const DEFAULT_FLAVOR = 'noite';
const groups = [...new Set(registry.ports.map((p) => p.group))];
for (const g of groups) {
  const names = registry.ports.filter((p) => p.group === g).map((p) => p.name);
  const svg = groupOgSvg(DEFAULT_FLAVOR, palette.flavors[DEFAULT_FLAVOR], registry.groups[g], names);
  await sharp(Buffer.from(svg)).png().toFile(join(root, `public/og-ports-${g}.png`));
}
console.log(`og-ports-*.png (${groups.length})`);

console.log(`\n${SURFACES.length} surfaces · ${ACCENTS.length} accents · ${Object.keys(palette.flavors).length} flavours`);
