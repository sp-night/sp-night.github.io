/**
 * The README's generated blocks, checked against the data they are generated
 * from.
 *
 * `npm run assets` writes those blocks, and it is run by hand. That is how the
 * ports table came to list two of four ports for three weeks: the catalogue
 * grew, nobody re-ran the script, and the front page of the repository quietly
 * advertised half the project. A note in the README asking people to re-run it
 * had been there the whole time.
 *
 * So the rule becomes a gate, the same way tests/no-raw-hex.test.ts turned "no
 * hex outside src/data" from a convention into a failure. These assert the
 * facts, not the formatting — re-styling the table is free, forgetting to
 * regenerate it is not.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ports } from '../src/data/ports';
import { COLOUR_COUNT, flavors } from '../src/data/palette';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

const block = (name: string): string => {
  const match = readme.match(new RegExp(`<!-- ${name}:start -->([\\s\\S]*?)<!-- ${name}:end -->`));
  if (!match) throw new Error(`README has no ${name} block`);
  return match[1]!;
};

describe('the README ports table', () => {
  const table = block('ports-table');

  it('lists every published port', () => {
    for (const p of ports) {
      expect(table, `${p.name} is missing — run npm run assets`).toContain(`[${p.name}](${p.repo})`);
    }
  });

  it('lists nothing that is not published', () => {
    const rows = table.split('\n').filter((l) => l.startsWith('| ['));
    expect(rows, 'the table has rows the catalogue does not — run npm run assets').toHaveLength(
      ports.length,
    );
  });
});

describe('the README palette table', () => {
  const table = block('palette-table');

  it('names every colour in the contract', () => {
    for (const c of flavors[0]!.list) {
      expect(table, `${c.key} is missing — run npm run assets`).toContain(c.key);
    }
  });
});

describe('the counts the README states in prose', () => {
  /* Prose outside the generated blocks cannot be regenerated, so it is asserted
     instead. The palette grew from 22 to 23 with fg_vivo and every hand-typed
     "22" became a lie in the same commit. */
  it('agrees with the contract on how many colours there are', () => {
    const stale = readme.match(/\b(\d+) colours\b/g) ?? [];
    for (const claim of stale) {
      expect(claim, 'a colour count in the README is out of date').toBe(`${COLOUR_COUNT} colours`);
    }
    expect(readme, 'the colours badge is out of date').toContain(`colours-${COLOUR_COUNT}-`);
  });
});
