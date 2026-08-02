/**
 * Design rule S4: zero hex literals outside src/data. Every colour on the site
 * must derive from the palette JSON through the data module, so a hex anywhere
 * else is a hardcoded colour that will not follow the flavor switcher.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(import.meta.dirname, '..', 'src');
const HEX = /#[0-9a-fA-F]{6}\b/;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return name === 'data' ? [] : walk(path);
    }
    return [path];
  });
}

describe('no raw hex outside src/data', () => {
  it('finds no hex literal in layouts, components, pages, styles or scripts', () => {
    const offenders = walk(SRC)
      .filter((file) => HEX.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });
});
