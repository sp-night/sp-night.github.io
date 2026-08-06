/**
 * Guards for the port catalogue (src/data/ports.yml, vendored from the engine).
 * A malformed entry must fail here, before it ever reaches a port page.
 *
 * Two of these carry most of the weight:
 *
 * - "every port is published" keeps the site's promise that everything on the
 *   ports page can be installed today.
 * - "every role and key resolves" is the one that catches a catalogue which has
 *   outrun the vendored palette. The contract sync copies both in one step, so
 *   they agree by construction — this is the net for when someone edits one by
 *   hand, and it is the check the sync's own pull-request gate runs.
 */
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  GROUP_LABELS,
  copy,
  expand,
  isFlavored,
  keyLabel,
  ports,
  portsByGroup,
} from '../src/data/ports';
import { flavors } from '../src/data/palette';
import { previewText, spanColor } from '../src/data/preview';

const previewsDir = new URL('../public/previews/', import.meta.url);

describe('port catalogue', () => {
  it('lists at least one port', () => {
    expect(ports.length).toBeGreaterThan(0);
  });

  it('has unique slugs', () => {
    const slugs = ports.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('only uses declared groups', () => {
    for (const p of ports) {
      expect(Object.keys(GROUP_LABELS)).toContain(p.group);
    }
  });

  it('publishes every port it lists', () => {
    for (const p of ports) {
      expect(p.repo, `${p.slug} has no repo`).toBe(`https://github.com/sp-night/${p.slug}`);
    }
  });

  it('uses valid https homepages', () => {
    for (const p of ports) {
      expect(p.homepage).toMatch(/^https:\/\//);
    }
  });

  it('gives every port a real install path', () => {
    for (const p of ports) {
      expect(p.install.length, `${p.slug} has no install path`).toBeGreaterThan(0);
    }
  });

  it('names a mapping template for every port', () => {
    for (const p of ports) {
      expect(p.template, `${p.slug}`).toMatch(/\.tmpl$/);
    }
  });

  it('leaves no port out of the grouped view, and shows no empty group', () => {
    const grouped = portsByGroup.flatMap((g) => g.items);
    expect(grouped).toHaveLength(ports.length);
    for (const g of portsByGroup) {
      expect(g.items.length).toBeGreaterThan(0);
    }
  });
});

describe('what a port page needs', () => {
  it('carries an install guide with balanced code fences', () => {
    for (const p of ports) {
      expect(p.install_guide.length, `${p.slug} has no install guide`).toBeGreaterThan(0);
      const fences = p.install_guide.match(/^```/gm) ?? [];
      // An odd count means a fence never closes, and the block splitter would
      // silently swallow the rest of the guide.
      expect(fences.length % 2, `${p.slug} has an unclosed code fence`).toBe(0);
    }
  });

  it('describes what gets themed', () => {
    for (const p of ports) {
      expect(p.mapping.length, `${p.slug} has no mapping table`).toBeGreaterThan(0);
      for (const row of p.mapping) {
        expect(row.key, `${p.slug} mapping row without a key`).toBeTruthy();
        expect(row.role, `${p.slug} mapping row without a role`).toBeTruthy();
      }
      expect(keyLabel(p)).toBeTruthy();
    }
  });

  it('declares a preview with a title, a body and a swatch strip', () => {
    for (const p of ports) {
      expect(p.preview.title, `${p.slug}`).toBeTruthy();
      expect(p.preview.body.length, `${p.slug} has an empty preview`).toBeGreaterThan(0);
      expect(p.preview.swatches.label, `${p.slug}`).toBeTruthy();
      const { roles, keys } = p.preview.swatches;
      expect(Boolean(roles?.length) !== Boolean(keys?.length), `${p.slug} swatches`).toBe(true);
    }
  });

  it('gives every preview span exactly one source of colour', () => {
    for (const p of ports) {
      for (const line of p.preview.body) {
        for (const s of line) {
          expect(Boolean(s.r) !== Boolean(s.c), `${p.slug}: "${s.t}"`).toBe(true);
        }
      }
    }
  });
});

describe('the catalogue agrees with the vendored palette', () => {
  it('resolves every role and key a preview paints with', () => {
    for (const p of ports) {
      for (const line of p.preview.body) {
        for (const s of line) {
          expect(() => spanColor(s), `${p.slug}: "${s.t}"`).not.toThrow();
        }
      }
      for (const role of p.preview.swatches.roles ?? []) {
        expect(() => spanColor({ t: '', r: role }), `${p.slug} swatch`).not.toThrow();
      }
      for (const key of p.preview.swatches.keys ?? []) {
        expect(() => spanColor({ t: '', c: key }), `${p.slug} swatch`).not.toThrow();
      }
    }
  });

  it('resolves every hex a preview prints as text', () => {
    for (const p of ports) {
      for (const f of flavors) {
        for (const line of p.preview.body) {
          for (const s of line) {
            expect(() => previewText(s.t, f), `${p.slug}/${f.id}: "${s.t}"`).not.toThrow();
          }
        }
      }
    }
  });

  it('leaves no placeholder behind once a flavour is chosen', () => {
    for (const p of ports) {
      for (const f of flavors) {
        const rendered = [
          expand(p.install, f.id, f.label),
          expand(p.activate ?? '', f.id, f.label),
          previewText(p.preview.title, f),
          ...p.preview.body.flat().map((s) => previewText(s.t, f)),
        ];
        for (const text of rendered) {
          expect(isFlavored(text), `${p.slug}/${f.id}: "${text}"`).toBe(false);
        }
      }
    }
  });
});

describe('the previews the pages render', () => {
  it('ships an SVG for every port and flavour', () => {
    for (const p of ports) {
      for (const f of flavors) {
        const file = new URL(`${p.slug}-${f.id}.svg`, previewsDir);
        expect(existsSync(file), `public/previews/${p.slug}-${f.id}.svg is missing`).toBe(true);
      }
    }
  });
});

describe('the shared prose', () => {
  it('carries the fragments a port page composes', () => {
    expect(copy.provenance).toBeTruthy();
    expect(copy.mapping_section).toContain('{template}');
    expect(copy.flavours_intro).toBeTruthy();
    for (const f of flavors) {
      expect(copy.flavours[f.id], `no blurb for ${f.id}`).toBeTruthy();
    }
  });
});
