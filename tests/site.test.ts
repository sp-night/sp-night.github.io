/**
 * Guards for what the site built on top of the data in rounds 7–9: the
 * per-flavour headline, the contrast floors drawn on /palette, and the
 * inventory page that must never ship.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTRAST_POLICY, flavors, floorFor } from '../src/data/palette';
import { groupLede, heroLines } from '../src/data/content';
import { portsByGroup } from '../src/data/ports';

describe('hero headline', () => {
  // The home page renders one headline per flavour of the contract. A flavour
  // added upstream with no line here would render a hero with no title.
  it('has three non-empty lines for every flavour in the contract', () => {
    for (const f of flavors) {
      const lines = (heroLines as Record<string, string[] | undefined>)[f.id];
      expect(lines, `no headline for "${f.id}"`).toBeDefined();
      expect(lines).toHaveLength(3);
      for (const line of lines!) expect(line.trim()).not.toBe('');
    }
  });

  it('names no flavour the contract does not have', () => {
    const ids = flavors.map((f) => f.id);
    expect(Object.keys(heroLines).filter((id) => !ids.includes(id))).toEqual([]);
  });
});

describe('port group pages', () => {
  // One page per group of the catalogue. A group the engine adds with no lede
  // here would render a page that opens on nothing.
  it('has a lede for every group the catalogue fills', () => {
    for (const { group } of portsByGroup) {
      expect(groupLede[group]?.trim(), `no lede for "${group}"`).toBeTruthy();
    }
  });

  it('names no group the catalogue does not fill', () => {
    const groups = portsByGroup.map((g) => g.group);
    expect(Object.keys(groupLede).filter((g) => !groups.includes(g))).toEqual([]);
  });
});

describe('floorFor', () => {
  // The bars on /palette draw these floors. They must be the audit's numbers,
  // not a second opinion.
  it('returns each foreground rule for the surfaces it names', () => {
    for (const rule of CONTRAST_POLICY.filter((r) => r.kind === 'foreground')) {
      for (const surface of rule.surfaces ?? []) {
        expect(floorFor(rule.subject, surface), `${rule.subject} on ${surface}`).toBe(rule.floor);
      }
    }
  });

  it("falls back to the surface's own floor for a colour with no rule", () => {
    for (const rule of CONTRAST_POLICY.filter((r) => r.kind === 'surface')) {
      expect(floorFor('taxi', rule.subject), `taxi on ${rule.subject}`).toBe(rule.floor);
    }
  });

  it('is undefined where the policy says nothing', () => {
    expect(floorFor('taxi', 'no-such-surface')).toBeUndefined();
  });
});

describe('/kit', () => {
  // The inventory is for local eyes. Its only guard against shipping is the
  // DEV check in getStaticPaths; if that line changes, this should notice.
  it('emits its route only under astro dev', () => {
    const src = readFileSync(join(import.meta.dirname, '..', 'src', 'pages', '[kit].astro'), 'utf8');
    expect(src).toMatch(/return import\.meta\.env\.DEV \? \[[^\]]*\] : \[\];/);
  });
});
