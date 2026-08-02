/**
 * Generates the static image assets from the palette, so they can never drift
 * from the theme: one Open Graph card and one favicon per flavour.
 *
 *   node scripts/gen-assets.mjs
 *
 * Outputs into public/: og-<flavor>.png (1200x630), favicon-<flavor>.svg,
 * logo-<flavor>.svg, palette-<flavor>.svg, the touch/PWA icons with
 * site.webmanifest, and the hex table kept between markers in README.md.
 * Re-run whenever the palette changes. Every colour below is read from
 * src/data/palette.json — no hex is written by hand.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const palette = JSON.parse(readFileSync(join(root, 'src/data/palette.json'), 'utf8'));

const SURFACES = ['vao', 'laje', 'concreto', 'vidro', 'fiacao'];
const TEXT = ['fg', 'fg_dim', 'fg_muted'];
const ACCENTS = ['brasa', 'sodio', 'taxi', 'ibira', 'estaiada', 'sereno', 'marginal', 'temporal'];
const VIVO = ['brasa_vivo', 'taxi_vivo', 'ibira_vivo', 'sereno_vivo', 'marginal_vivo', 'temporal_vivo'];

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

function ogSvg(flavor) {
  const c = flavor.colors;
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
      <stop offset="0" stop-color="${c.sodio}" stop-opacity="0.26"/>
      <stop offset="0.55" stop-color="${c.sodio}" stop-opacity="0.05"/>
      <stop offset="1" stop-color="${c.sodio}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect width="1200" height="630" fill="url(#lamp)"/>
  <g opacity="0.5">${skyline(c)}</g>
  <rect x="0" y="626" width="1200" height="4" fill="${c.vao}"/>

  <g transform="translate(72 76) scale(0.72)">${markInline(flavor)}</g>
  <text x="132" y="114" font-family="ui-monospace, monospace" font-size="30" font-weight="700" fill="${c.fg}">SP Night</text>

  <text x="72" y="252" font-family="ui-sans-serif, system-ui, sans-serif" font-size="76" font-weight="640" fill="${c.fg}">The sodium lamp turns</text>
  <text x="72" y="336" font-family="ui-sans-serif, system-ui, sans-serif" font-size="76" font-weight="640" fill="${c.sodio}">the whole city this colour.</text>

  <text x="72" y="404" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30" fill="${c.fg_dim}">A dark theme with São Paulo as its reference — ${flavor.label}</text>

  ${swatches}
</svg>`;
}

/**
 * The mark: Pico do Jaraguá at dusk. Jaraguá (1,135 m) and Pico do Papagaio
 * (1,127 m) are almost the same height and split by a saddle, so the massif
 * reads as rounded domes — eroded Atlantic-forest mountain, not alpine rock.
 * The landmark is the tower: a very tall, slender lattice mast banded red and
 * white, taller than the visible hill, with the aviation beacon on top and
 * São Paulo's lights at the foot of the range. Kept in sync with src/components/Logo.astro, which draws the same
 * shape with CSS custom properties instead of baked hexes.
 */
function markSvg(flavor, size = 64) {
  const c = flavor.colors;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.vao}"/>
      <stop offset="0.26" stop-color="${c.vao}"/>
      <stop offset="0.52" stop-color="${c.temporal}" stop-opacity="0.44"/>
      <stop offset="0.78" stop-color="${c.sodio}" stop-opacity="0.72"/>
      <stop offset="1" stop-color="${c.taxi}" stop-opacity="0.9"/>
    </linearGradient>
    <radialGradient id="beacon">
      <stop offset="0" stop-color="${c.brasa}" stop-opacity="0.62"/>
      <stop offset="1" stop-color="${c.brasa}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="64" height="64" rx="13" fill="url(#sky)"/>
  <path d="M-2 64 C4 59 9 53 15 49 C20 46 24 45 28 47 C32 49 35 53 39 53 C44 53 49 47 55 45 C59 43 63 47 66 51 L66 64 Z" fill="${c.concreto}" opacity="0.6"/>
  <path d="M-2 64 C7 60 13 55 19 50 C24 45 27 33 32 33 C37 33 41 43 46 47 C50 50 54 46 58 46 C61 46 64 50 66 53 L66 64 Z" fill="${c.vao}"/>
  <g fill="${c.sodio}" opacity="0.9">
    <rect x="5" y="60.4" width="1.4" height="1.4"/><rect x="9.5" y="61.6" width="1.4" height="1.4"/>
    <rect x="14" y="60.6" width="1.4" height="1.4"/><rect x="51" y="61" width="1.4" height="1.4"/>
    <rect x="55.5" y="61.8" width="1.4" height="1.4"/><rect x="59.5" y="60.4" width="1.4" height="1.4"/>
  </g>
  <line x1="58" y1="46" x2="58" y2="39" stroke="${c.fg_muted}" stroke-width="0.8" opacity="0.8"/>
  <path d="M29.4 33 L31.32 6 L32.68 6 L34.6 33 Z" fill="${c.fg}"/>
  <path d="M31.32 6 L32.68 6 L32.95 9.86 L31.05 9.86 Z" fill="${c.brasa}"/>
  <path d="M30.77 13.71 L33.23 13.71 L33.5 17.57 L30.5 17.57 Z" fill="${c.brasa}"/>
  <path d="M30.22 21.43 L33.78 21.43 L34.05 25.29 L29.95 25.29 Z" fill="${c.brasa}"/>
  <path d="M29.67 29.14 L34.33 29.14 L34.6 33 L29.4 33 Z" fill="${c.brasa}"/>
  <circle cx="32" cy="4.6" r="5.5" fill="url(#beacon)"/>
  <circle cx="32" cy="4.6" r="1.7" fill="${c.brasa}"/>
</svg>`;
}

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
  const svg = ogSvg(flavor);
  await sharp(Buffer.from(svg)).png().toFile(join(root, `public/og-${id}.png`));
  writeFileSync(join(root, `public/favicon-${id}.svg`), markSvg(flavor));
  writeFileSync(join(root, `public/logo-${id}.svg`), markSvg(flavor, 256));
  writeFileSync(join(root, `public/palette-${id}.svg`), stripSvg(flavor));
  console.log(`og-${id}.png + favicon-${id}.svg + logo-${id}.svg + palette-${id}.svg`);
}

// The default favicon mirrors the default flavour.
writeFileSync(join(root, 'public/favicon.svg'), markSvg(palette.flavors.noite));
console.log('favicon.svg (noite)');

/* Touch and PWA icons mirror the default flavour, flattened onto vao — the
   platforms mask their own corners, so no transparency survives anyway. */
function flatIconSvg(flavor, size) {
  return markSvg(flavor, size).replace(
    '<rect width="64" height="64" rx="13"',
    `<rect width="64" height="64" fill="${flavor.colors.vao}"/><rect width="64" height="64" rx="13"`,
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

/* The README hex table lives between markers and is rewritten here, so the
   published values can never drift from the palette. */
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

const readmePath = join(root, 'README.md');
const readme = readFileSync(readmePath, 'utf8');
const START = '<!-- palette-table:start -->';
const END = '<!-- palette-table:end -->';
if (readme.includes(START) && readme.includes(END)) {
  const block = [
    START,
    '<details>',
    `<summary>The ${KEYS.length} hex values, all three flavours</summary>`,
    '',
    hexTable(),
    '',
    '</details>',
    END,
  ].join('\n');
  const start = readme.indexOf(START);
  const end = readme.indexOf(END) + END.length;
  writeFileSync(readmePath, readme.slice(0, start) + block + readme.slice(end));
  console.log('README.md palette table');
}

console.log(`\n${SURFACES.length} surfaces · ${ACCENTS.length} accents · ${Object.keys(palette.flavors).length} flavours`);
