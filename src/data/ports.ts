/**
 * Loader for the port registry. The data itself lives in resources/ports.yml —
 * the single source of truth — and this module parses it at build time and
 * refuses to build on a bad entry. Pages import from here; none of them know
 * the registry is YAML.
 *
 * Every port in the registry is published: `repo` is required, so the site has
 * no concept of a planned port and cannot render a card for something that does
 * not exist yet.
 */
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

export type PortGroup = 'terminal' | 'shell';

export interface Port {
  slug: string;
  name: string;
  group: PortGroup;
  /** One-line description of what the port covers. */
  blurb: string;
  /** Where the file goes on the user's machine. */
  install: string;
  /** Extra line the user must add, if the app needs one. */
  activate?: string;
  note?: string;
  homepage: string;
  /** The published sp-night/<slug> repository. */
  repo: string;
}

interface Registry {
  groups: Record<PortGroup, string>;
  ports: Port[];
}

const registry = parse(
  readFileSync(new URL('../../resources/ports.yml', import.meta.url), 'utf8'),
) as Registry;

export const GROUP_LABELS = registry.groups;

const REQUIRED = ['slug', 'name', 'group', 'blurb', 'install', 'homepage', 'repo'] as const;

for (const p of registry.ports) {
  for (const field of REQUIRED) {
    if (typeof p[field] !== 'string' || p[field] === '') {
      throw new Error(`ports.yml: "${p.slug ?? '?'}" is missing ${field}`);
    }
  }
  if (!(p.group in GROUP_LABELS)) {
    throw new Error(`ports.yml: "${p.slug}" has unknown group "${p.group}"`);
  }
}

export const ports: Port[] = registry.ports;

export const portsByGroup = (Object.keys(GROUP_LABELS) as PortGroup[])
  .map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: ports.filter((p) => p.group === group),
  }))
  .filter((g) => g.items.length > 0);

export const port = (slug: string): Port | undefined => ports.find((p) => p.slug === slug);
