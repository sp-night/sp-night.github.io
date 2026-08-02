/**
 * Loader for the port registry. The data itself lives in resources/ports.yml —
 * the single source of truth, in the spirit of catppuccin's ports.yml — and
 * this module parses it at build time and refuses to build on a bad entry.
 * Pages import from here; none of them know the registry is YAML.
 */
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

export type PortGroup = 'terminal' | 'editor' | 'shell' | 'desktop' | 'web';

export interface Port {
  slug: string;
  name: string;
  group: PortGroup;
  /** One-line description of what the target is. */
  blurb: string;
  /** Path inside dist/, with {flavor} / {label} placeholders. */
  dist: string;
  /** Where the file goes on the user's machine. */
  install: string;
  /** Extra line the user must add, if the app needs one. */
  activate?: string;
  note?: string;
  homepage: string;
  /** The published port repository, once it ships. Absent = still planned. */
  repo?: string;
}

interface Registry {
  groups: Record<PortGroup, string>;
  ports: Port[];
}

const registry = parse(
  readFileSync(new URL('../../resources/ports.yml', import.meta.url), 'utf8'),
) as Registry;

export const GROUP_LABELS = registry.groups;

const REQUIRED = ['slug', 'name', 'group', 'blurb', 'dist', 'install', 'homepage'] as const;

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

export const portsByGroup = (Object.keys(GROUP_LABELS) as PortGroup[]).map((group) => ({
  group,
  label: GROUP_LABELS[group],
  items: ports.filter((p) => p.group === group),
}));

export const port = (slug: string): Port | undefined => ports.find((p) => p.slug === slug);
