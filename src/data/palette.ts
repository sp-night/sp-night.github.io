/**
 * Single source of truth for colour data on this site — and, through
 * /palette.json and /roles.json, for the project as a whole.
 *
 * Reads palette.json + roles.json and derives every representation the pages
 * need — RGB, HSL, OKLCH and WCAG contrast ratios — at build time. No component
 * reads the JSON directly and no component ever writes a hex literal.
 *
 * The two JSON files are the contract; everything here is derivation on top of
 * them, so nothing downstream has to agree with this module to agree with the
 * palette.
 */
import paletteJson from './palette.json';
import rolesJson from './roles.json';
import contrastJson from './contrast.json';
import { colorMeaningEn, flavorCopy } from './content';

export type ColorKey = string;
export type FlavorId = string;

/**
 * A band id, as declared in the contract's `groups` block. Not a union of
 * literals on purpose: this site does not get to decide what the bands are.
 */
export type ColorGroup = string;

export interface RGB {
  r: number;
  g: number;
  b: number;
}
export interface HSL {
  h: number;
  s: number;
  l: number;
}
export interface OKLCH {
  l: number;
  c: number;
  h: number;
}

export interface Color {
  key: ColorKey;
  hex: string;
  rgb: RGB;
  hsl: HSL;
  oklch: OKLCH;
  group: ColorGroup;
  /** Poetic gloss: the São Paulo referent behind the name. */
  meaning: { pt: string; en: string };
  /** True for the eight signature accents (not surfaces, text or bright pairs). */
  isAccent: boolean;
  /** For a `*_vivo` colour, the key of the accent it brightens. */
  vivoOf?: ColorKey;
  /** For an accent that has one, the key of its bright counterpart. */
  vivo?: ColorKey;
  /** WCAG ratios against the three main backgrounds. */
  contrast: { vao: number; laje: number; concreto: number };
}

export interface Flavor {
  id: FlavorId;
  label: string;
  description: string;
  colors: Record<ColorKey, Color>;
  /** Ordered list, palette order. */
  list: Color[];
  roles: ResolvedRoles;
}

export type ResolvedRoles = Record<string, Record<string, { key: ColorKey; hex: string }>>;

/* ------------------------------------------------------------------ maths */

export function parseHex(hex: string): RGB {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function toHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: round(h, 1), s: round(s, 3), l: round(l, 3) };
}

/** sRGB channel -> linear light. */
function linearize(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

/** OKLab, then polar form (OKLCH). Matches color.go's conversion. */
export function toOklch(rgb: RGB): OKLCH {
  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: round(L, 3), c: round(Math.hypot(A, B), 3), h: round(h, 1) };
}

export function luminance(rgb: RGB): number {
  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b);
}

/** WCAG 2.1 contrast ratio between two hex colours. */
export function contrast(hexA: string, hexB: string): number {
  const a = luminance(parseHex(hexA));
  const b = luminance(parseHex(hexB));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return round((hi + 0.05) / (lo + 0.05), 2);
}

function round(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

/* ------------------------------------------------------------------ build */

const raw = paletteJson as unknown as {
  name: string;
  label: string;
  description: string;
  author: string;
  url: string;
  meaning: Record<string, string>;
  groups: Record<string, { label: string; keys: ColorKey[] }>;
  flavors: Record<string, { label: string; description: string; colors: Record<string, string> }>;
};

/* --------------------------------------------------------------- taxonomy */

/**
 * The English gloss for each band, keyed by its id in the contract.
 *
 * Only the prose lives here. The bands themselves — which ids exist, what they
 * are called, which colours are in them, in what order — come from the
 * contract's `groups` block, because this site used to re-declare all of that
 * and a colour the contract added but this list did not know about vanished
 * from the published palette with nothing failing. Same split as
 * `colorMeaningEn`: the contract's prose is Portuguese, the site's is English.
 */
const GROUP_BLURB: Record<string, string> = {
  surfaces: 'Five stacked planes, from the deepest recess to the wiring that divides it.',
  text:
    'Four levels of foreground, each holding AA contrast on the surfaces it is used over. ' +
    'fg_vivo is the bright end: bold default text, and the terminal’s bright white.',
  accents: 'Eight signature colours. Hue and chroma carry the identity — never brightness.',
  vivo: 'The terminal bright set: same hue and chroma, lifted 0.06 in OKLCH lightness.',
};

/**
 * The heading each band gets on this site. Copy, like the blurbs: the contract
 * calls the bright band "Bright ANSI" because that is what it is for, and this
 * site has always called it "Bright pairs" because that is what a reader is
 * looking at. Membership and order are not ours to choose; wording is.
 *
 * A band the contract adds and this list has not caught up with falls back to
 * the contract's own label, so a new band gets a heading rather than a blank.
 */
const GROUP_LABEL: Record<string, string> = {
  vivo: 'Bright pairs',
};

/** Band ids in the order the contract declares them. */
export const GROUP_IDS: ColorGroup[] = Object.keys(raw.groups);

export const GROUPS: Record<ColorGroup, { label: string; blurb: string; keys: ColorKey[] }> =
  Object.fromEntries(
    GROUP_IDS.map((id) => [
      id,
      {
        label: GROUP_LABEL[id] ?? raw.groups[id]!.label,
        blurb: GROUP_BLURB[id] ?? '',
        keys: raw.groups[id]!.keys,
      },
    ]),
  );

/** Palette order: the bands, in the order they are presented. */
export const ORDER: ColorKey[] = GROUP_IDS.flatMap((g) => GROUPS[g]!.keys);

/** How many colours the contract declares. Rendered, never typed into prose. */
export const COLOUR_COUNT = ORDER.length;

/**
 * The contrast policy, straight from the audit that enforces it.
 *
 * `contrast.json` is `spn check --json`, vendored by the same sync that brings
 * the palette. It is not part of the contract — it is what the tool says about
 * itself — but it is published here, and a published policy that was typed by
 * hand is a policy that can be wrong where everyone can read it. This site used
 * to hold both the pair count and the floors table as prose, and the table
 * contradicted the tool on `fg_dim`.
 */
export interface ContrastRule {
  subject: string;
  kind: 'surface' | 'foreground';
  surfaces?: string[];
  floor: number;
  gate: boolean;
}

const audit = contrastJson as unknown as {
  pairs_per_flavor: number;
  flavors: string[];
  policy: ContrastRule[];
};

/** How many text/surface pairs the audit measures per flavour. */
export const MEASURED_PAIRS = audit.pairs_per_flavor;

/** The floors, in the order the audit publishes them. */
export const CONTRAST_POLICY: ContrastRule[] = audit.policy;

/**
 * base -> its bright twin, read off the naming rule rather than listed. A
 * `<base>_vivo` is the contract's word for "this colour, lifted".
 */
const VIVO_SUFFIX = '_vivo';
const baseOf = (key: ColorKey): ColorKey | undefined =>
  key.endsWith(VIVO_SUFFIX) ? key.slice(0, -VIVO_SUFFIX.length) : undefined;

const VIVO_PAIRS: Record<ColorKey, ColorKey> = Object.fromEntries(
  ORDER.flatMap((k) => {
    const base = baseOf(k);
    return base ? [[base, k] as const] : [];
  }),
);

const groupOf = (key: ColorKey): ColorGroup =>
  GROUP_IDS.find((g) => GROUPS[g]!.keys.includes(key)) ?? GROUP_IDS[0]!;

function buildColor(key: ColorKey, hex: string, colors: Record<string, string>): Color {
  const rgb = parseHex(hex);
  const group = groupOf(key);
  return {
    key,
    hex,
    rgb,
    hsl: toHsl(rgb),
    oklch: toOklch(rgb),
    group,
    meaning: { pt: raw.meaning[key] ?? '', en: colorMeaningEn[key] ?? '' },
    isAccent: group === 'accents',
    vivoOf: baseOf(key),
    vivo: VIVO_PAIRS[key],
    contrast: {
      vao: contrast(hex, colors.vao!),
      laje: contrast(hex, colors.laje!),
      concreto: contrast(hex, colors.concreto!),
    },
  };
}

function resolveRoles(colors: Record<string, Color>): ResolvedRoles {
  const out: ResolvedRoles = {};
  for (const [groupName, group] of Object.entries(rolesJson as Record<string, unknown>)) {
    if (groupName.startsWith('$') || typeof group !== 'object' || group === null) continue;
    const resolved: Record<string, { key: ColorKey; hex: string }> = {};
    for (const [role, key] of Object.entries(group as Record<string, string>)) {
      if (role.startsWith('$')) continue;
      const color = colors[key];
      if (color) resolved[role] = { key, hex: color.hex };
    }
    out[groupName] = resolved;
  }
  return out;
}

export const flavors: Flavor[] = Object.entries(raw.flavors).map(([id, f]) => {
  const colors: Record<ColorKey, Color> = {};
  for (const key of ORDER) {
    const hex = f.colors[key];
    if (hex) colors[key] = buildColor(key, hex, f.colors);
  }
  return {
    id,
    label: f.label,
    description: flavorCopy[id as keyof typeof flavorCopy]?.story.en ?? f.description,
    colors,
    list: ORDER.map((k) => colors[k]!).filter(Boolean),
    roles: resolveRoles(colors),
  };
});

export const defaultFlavor: FlavorId = 'noite';

export const flavor = (id: FlavorId): Flavor =>
  flavors.find((f) => f.id === id) ?? flavors[0]!;

/**
 * Where the project lives. Every GitHub link on the site comes from here, so a
 * repository that moves is one edit rather than a grep.
 */
export const org = {
  url: 'https://github.com/sp-night',
  /** The contract and the tool: the palette, the role layer and the engine. */
  engine: 'https://github.com/sp-night/sp-night',
  /** This site. */
  site: 'https://github.com/sp-night/sp-night.github.io',
  issues: 'https://github.com/sp-night/sp-night.github.io/issues',
  contributing: 'https://github.com/sp-night/sp-night.github.io/blob/main/CONTRIBUTING.md',
  conduct: 'https://github.com/sp-night/sp-night.github.io/blob/main/CODE_OF_CONDUCT.md',
  license: 'https://github.com/sp-night/sp-night.github.io/blob/main/LICENSE',
  /** `?template=` targets, so the two issue forms are reachable from the site. */
  colourProblem:
    'https://github.com/sp-night/sp-night.github.io/issues/new?template=colour-problem.yml',
  portProposal:
    'https://github.com/sp-night/sp-night.github.io/issues/new?template=port-proposal.yml',
};

export const theme = {
  name: raw.name,
  label: raw.label,
  author: raw.author,
  repoUrl: org.url,
  // No count that this module cannot derive. The old copy claimed "17 targets"
  // long after the registry had been cut to what is actually published, and it
  // was the meta description of every page.
  description:
    `A dark colour scheme with São Paulo as its reference: the sodium street lamp, exposed concrete, the free span of the MASP, the drizzle before the rain. Three flavours, ${COLOUR_COUNT} colours, every pairing measured before it ships.`,
};

/** `var(--sp-…)` for a palette key. */
export const keyVar = (key: ColorKey): string => `var(--sp-${key.replace(/_/g, '-')})`;

/**
 * `var(--sp-…)` for a semantic role, e.g. roleVar('syntax', 'keyword').
 * Roles resolve to palette keys, which are the same across flavours — only the
 * hex behind the key changes — so this is safe to use in static markup.
 */
export function roleVar(group: string, role: string): string {
  const key = flavors[0]!.roles[group]?.[role]?.key;
  return key ? keyVar(key) : 'currentColor';
}

/** CSS custom property block for one flavour — the only place hex reaches CSS. */
export function cssVars(f: Flavor): string {
  return f.list.map((c) => `--sp-${c.key.replace(/_/g, '-')}: ${c.hex};`).join('\n    ');
}

/** `:root[data-flavor="…"]` blocks for every flavour, emitted once in the layout. */
export function flavorStylesheet(): string {
  const vars = flavors
    .map((f) => `:root[data-flavor="${f.id}"] {\n    ${cssVars(f)}\n  }`)
    .join('\n  ');

  // Per-flavour text (hex values, ratios) is rendered for every flavour and
  // hidden by CSS, so the pages stay static HTML with no client-side lookup.
  const visibility = flavors
    .map((f) => `:root[data-flavor="${f.id}"] [data-f]:not([data-f="${f.id}"]) { display: none; }`)
    .join('\n  ');

  return `${vars}\n  ${visibility}`;
}
