/**
 * Loader for the port catalogue.
 *
 * `ports.yml` and `copy.yml` are **vendored** from `sp-night/sp-night` at
 * `registry/`, byte for byte, by the same contract sync that brings
 * `palette.json`, `roles.json` and `contrast.json`. Editing them here is a
 * change that disappears at the next sync without leaving a trace: a port is
 * added by editing the catalogue in the engine, and the sync opens a pull
 * request against this repository.
 *
 * The catalogue carries far more than the site used to keep — the install
 * guide, the key→role table, the declarative preview — which is the point: a
 * port page can be generated the moment the entry lands, and nothing about that
 * page is typed twice.
 *
 * Validation mirrors `registry/registry.go` so the site refuses a catalogue the
 * engine would refuse. It is a whitelist of what must be present, never a check
 * that the shape is exhaustive: a field the engine adds has to be able to
 * arrive before this site knows what to do with it, or vendoring buys nothing.
 */
import { parse } from 'yaml';
import portsYaml from './ports.yml?raw';
import copyYaml from './copy.yml?raw';

/** A group key, e.g. `terminal`. Open by design — `groups` in the YAML rules. */
export type PortGroup = string;

/** One coloured run of preview text. `r` and `c` are mutually exclusive. */
export interface Span {
  t: string;
  /** A role, `group.role`. */
  r?: string;
  /** Or a raw palette key, for a strip whose job is to show colours. */
  c?: string;
  b?: boolean;
}

export interface Swatches {
  label: string;
  roles?: string[];
  keys?: string[];
}

/** The declarative screenshot. The port repo renders it to SVG; so do we. */
export interface Preview {
  title: string;
  /** One array per line. An empty array is a vertical gap, not a blank row. */
  body: Span[][];
  swatches: Swatches;
}

/** A row of the "What gets themed" table. All three are markdown fragments. */
export interface MappingRow {
  key: string;
  role: string;
  meaning?: string;
}

export interface Port {
  slug: string;
  name: string;
  group: PortGroup;
  /** One line on what the port covers. */
  blurb: string;
  homepage: string;
  /** The published sp-night/<slug> repository. */
  repo: string;
  /** Where the file goes on the user's machine. Carries {flavor}. */
  install: string;
  /** The line the user adds, if the app needs one. Carries {flavor}. */
  activate?: string;
  /** Caveat worth surfacing. */
  note?: string;
  /** The mapping file in the port repository, e.g. `ghostty.tmpl`. */
  template: string;
  /** The app-specific prose of the Install section, as markdown. */
  install_guide: string;
  mapping: MappingRow[];
  /** First column heading of the mapping table. Defaults to `<Name> key`. */
  key_label?: string;
  /** Trails "the table above in complete form…" in the mapping section. */
  mapping_scope?: string;
  /** Trails "without anyone re-deciding…" in the mapping section. */
  mapping_closer?: string;
  preview: Preview;
}

/** The prose every port shares, so no two ports describe the project differently. */
export interface Copy {
  logo_alt: string;
  tagline_strong: string;
  tagline: string;
  flavours_intro: string;
  flavours: Record<string, string>;
  provenance: string;
  /** {template}, {keylabel}, {scope} and {closer} are substituted. */
  mapping_section: string;
}

interface Registry {
  groups: Record<string, string>;
  ports: Port[];
}

const registry = parse(portsYaml) as Registry;

export const copy = parse(copyYaml) as Copy;

export const GROUP_LABELS = registry.groups;

const REQUIRED = [
  'slug',
  'name',
  'group',
  'blurb',
  'homepage',
  'repo',
  'install',
  'template',
  'install_guide',
] as const;

const seen = new Set<string>();

for (const p of registry.ports) {
  const where = `ports.yml: "${p.slug ?? '?'}"`;

  for (const field of REQUIRED) {
    if (typeof p[field] !== 'string' || p[field] === '') {
      throw new Error(`${where} is missing ${field}`);
    }
  }
  if (seen.has(p.slug)) throw new Error(`${where} is listed twice`);
  seen.add(p.slug);

  if (!(p.group in GROUP_LABELS)) {
    throw new Error(`${where} has unknown group "${p.group}"`);
  }
  // Derived, and checked: the registry says the repository is the slug under
  // the org, so a `repo` that disagrees is a typo rather than a decision.
  if (p.repo !== `https://github.com/sp-night/${p.slug}`) {
    throw new Error(`${where} has repo "${p.repo}", expected the org URL for its slug`);
  }
  if (!p.template.endsWith('.tmpl')) {
    throw new Error(`${where} has template "${p.template}", which is not a .tmpl`);
  }

  if (!Array.isArray(p.mapping) || p.mapping.length === 0) {
    throw new Error(`${where} has no mapping table`);
  }
  for (const row of p.mapping) {
    if (!row.key || !row.role) throw new Error(`${where} has a mapping row without key or role`);
  }

  const pv = p.preview;
  if (!pv?.title) throw new Error(`${where} has no preview title`);
  if (!Array.isArray(pv.body) || pv.body.length === 0) {
    throw new Error(`${where} has an empty preview body`);
  }
  for (const line of pv.body) {
    for (const s of line) {
      // Exactly one source of colour. Both set is ambiguous, neither is invisible.
      if (!!s.r === !!s.c) {
        throw new Error(`${where} has a preview span that sets ${s.r ? 'both' : 'neither'} r and c`);
      }
    }
  }
  const sw = pv.swatches;
  if (!sw?.label) throw new Error(`${where} has a swatch strip without a label`);
  if (!!sw.roles?.length === !!sw.keys?.length) {
    throw new Error(`${where} has swatches that set ${sw.roles?.length ? 'both' : 'neither'} roles and keys`);
  }
}

export const ports: Port[] = registry.ports;

/**
 * Groups in the order a port first calls for one — the same rule the engine
 * uses to order the catalogue, so the site and the generated READMEs agree.
 * `Object.keys` would order by however the YAML happens to declare them.
 */
export const groupOrder: PortGroup[] = [...new Set(ports.map((p) => p.group))];

export const portsByGroup = groupOrder
  .map((group) => ({
    group,
    label: GROUP_LABELS[group]!,
    items: ports.filter((p) => p.group === group),
  }))
  .filter((g) => g.items.length > 0);

export const port = (slug: string): Port | undefined => ports.find((p) => p.slug === slug);

/** The mapping table's first column heading. */
export const keyLabel = (p: Port): string => p.key_label ?? `${p.name} key`;

/**
 * `{flavor}` and `{label}` in an install path, an activation line or preview
 * text. Kept free of the palette so this module stays a pure registry loader —
 * the `{r:…}` and `{c:…}` forms, which resolve to colours, live in preview.ts.
 */
export const expand = (text: string, flavorId: string, flavorLabel: string): string =>
  text.replaceAll('{flavor}', flavorId).replaceAll('{label}', flavorLabel);

/** Whether a string differs between flavours and so needs one copy per flavour. */
export const isFlavored = (text: string): boolean => /\{(flavor|label|r:|c:)/.test(text);
