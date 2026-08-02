/**
 * Guards for the port registry (resources/ports.yml) — the equivalent of
 * catppuccin's schema validation step. A malformed entry must fail CI here,
 * before it ever reaches the /ports page.
 */
import { describe, expect, it } from 'vitest';
import { GROUP_LABELS, ports, portsByGroup } from '../src/data/ports';

describe('port registry', () => {
  it('has unique slugs', () => {
    const slugs = ports.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('only uses declared groups', () => {
    for (const p of ports) {
      expect(Object.keys(GROUP_LABELS)).toContain(p.group);
    }
  });

  it('points every shipped repo at the sp-night org', () => {
    for (const p of ports.filter((p) => p.repo)) {
      expect(p.repo).toBe(`https://github.com/sp-night/${p.slug}`);
    }
  });

  it('uses valid https homepages', () => {
    for (const p of ports) {
      expect(p.homepage).toMatch(/^https:\/\//);
    }
  });

  it('keeps dist paths inside dist/ with a flavour placeholder', () => {
    for (const p of ports) {
      expect(p.dist).toMatch(/^dist\/\{flavor\}\//);
      expect(p.dist).toMatch(/\{flavor\}|\{label\}/);
    }
  });

  it('leaves no port out of the grouped view', () => {
    const grouped = portsByGroup.flatMap((g) => g.items);
    expect(grouped).toHaveLength(ports.length);
  });
});
