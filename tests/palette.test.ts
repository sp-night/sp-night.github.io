/**
 * Guards for the colour data module — the single source of truth of the site.
 *
 * Three layers: the colour maths (ports of tools/gen/color.go), the shape of
 * the vendored data, and the contrast policy the palette promises. If a future
 * palette drop breaks any of these, the build should fail before deploy.
 */
import { describe, expect, it } from 'vitest';
import {
  GROUPS,
  ORDER,
  contrast,
  cssVars,
  defaultFlavor,
  flavor,
  flavorStylesheet,
  flavors,
  parseHex,
  toHsl,
  toOklch,
} from '../src/data/palette';

describe('colour maths', () => {
  it('parses hex into RGB channels', () => {
    expect(parseHex('#ff8000')).toEqual({ r: 255, g: 128, b: 0 });
  });

  it('converts pure red to HSL', () => {
    expect(toHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, l: 0.5 });
  });

  it('places white and black at the ends of the OKLCH lightness axis', () => {
    expect(toOklch({ r: 255, g: 255, b: 255 }).l).toBeCloseTo(1, 2);
    expect(toOklch({ r: 0, g: 0, b: 0 }).l).toBe(0);
  });

  it('gives white on black the maximum WCAG ratio of 21', () => {
    expect(contrast('#ffffff', '#000000')).toBe(21);
  });

  it('is symmetric', () => {
    expect(contrast('#e6a23c', '#0f101a')).toBe(contrast('#0f101a', '#e6a23c'));
  });
});

describe('vendored data shape', () => {
  it('ships the three flavours with noite as default', () => {
    expect(flavors.map((f) => f.id)).toEqual(['noite', 'garoa', 'jaragua']);
    expect(defaultFlavor).toBe('noite');
    expect(flavor('nope').id).toBe('noite');
  });

  it.each(flavors.map((f) => [f.id, f] as const))(
    '%s carries all 22 palette keys as valid hex',
    (_id, f) => {
      expect(f.list).toHaveLength(ORDER.length);
      expect(ORDER).toHaveLength(22);
      for (const c of f.list) {
        expect(c.hex).toMatch(/^#[0-9a-f]{6}$/i);
      }
    },
  );

  it('links every bright pair to its base accent', () => {
    for (const f of flavors) {
      for (const key of GROUPS.vivo.keys) {
        const bright = f.colors[key]!;
        const base = f.colors[bright.vivoOf!]!;
        expect(base.vivo).toBe(key);
        expect(base.group).toBe('accents');
      }
    }
  });

  it('resolves every semantic role to a real palette colour', () => {
    for (const f of flavors) {
      const groups = Object.keys(f.roles);
      expect(groups).toContain('ansi');
      for (const group of groups) {
        for (const [role, ref] of Object.entries(f.roles[group]!)) {
          expect(f.colors[ref.key], `${f.id}: ${group}.${role} -> ${ref.key}`).toBeDefined();
          expect(ref.hex).toBe(f.colors[ref.key]!.hex);
        }
      }
    }
  });
});

describe('contrast policy', () => {
  // The floors the palette promises, per SITE.md and verified against the data:
  // body text is AAA on every surface, dim text AA, muted text AA-large,
  // and every accent holds AA against the deepest background.
  const SURFACES = ['vao', 'laje', 'concreto'] as const;

  it.each(flavors.map((f) => [f.id, f] as const))('%s keeps text readable', (_id, f) => {
    for (const s of SURFACES) {
      expect(f.colors.fg!.contrast[s]).toBeGreaterThanOrEqual(7);
      expect(f.colors.fg_dim!.contrast[s]).toBeGreaterThanOrEqual(4.5);
      expect(f.colors.fg_muted!.contrast[s]).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(flavors.map((f) => [f.id, f] as const))('%s keeps accents AA on vao', (_id, f) => {
    for (const key of GROUPS.accents.keys) {
      expect(f.colors[key]!.contrast.vao, `${key} on vao`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('CSS emission', () => {
  it('emits one custom property per colour, underscores dashed', () => {
    const block = cssVars(flavor('noite'));
    expect(block).toContain('--sp-vao:');
    expect(block).toContain('--sp-brasa-vivo:');
    expect(block.match(/--sp-/g)).toHaveLength(22);
  });

  it('emits a :root block and a visibility rule per flavour', () => {
    const sheet = flavorStylesheet();
    for (const f of flavors) {
      expect(sheet).toContain(`:root[data-flavor="${f.id}"]`);
      expect(sheet).toContain(`[data-f]:not([data-f="${f.id}"])`);
    }
  });
});
