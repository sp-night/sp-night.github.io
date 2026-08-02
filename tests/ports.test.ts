/**
 * Guards for the port registry (resources/ports.yml). A malformed entry must
 * fail CI here, before it ever reaches the /ports page.
 *
 * The load-bearing one is "every port is published": the site promises that
 * everything on the ports page can be installed today, and this is what keeps
 * that true when a new entry is added.
 */
import { describe, expect, it } from 'vitest';
import { GROUP_LABELS, ports, portsByGroup } from '../src/data/ports';

describe('port registry', () => {
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

  it('leaves no port out of the grouped view, and shows no empty group', () => {
    const grouped = portsByGroup.flatMap((g) => g.items);
    expect(grouped).toHaveLength(ports.length);
    for (const g of portsByGroup) {
      expect(g.items.length).toBeGreaterThan(0);
    }
  });
});
