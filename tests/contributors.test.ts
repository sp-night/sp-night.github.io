/**
 * The contributor wall credits people. Nothing generated belongs on it, and the
 * page states that in as many words — so the claim is asserted rather than
 * trusted to whoever regenerates the list next.
 */
import { describe, expect, it } from 'vitest';
import data from '../src/data/contributors.json';

const NOT_A_PERSON = /^(github-actions|dependabot|renovate|renovate-bot|claude|claude-bot|copilot)$/i;

describe('the contributor list', () => {
  it('is not empty', () => {
    expect(data.contributors.length).toBeGreaterThan(0);
  });

  it('credits no bot and no generated account', () => {
    for (const p of data.contributors) {
      expect(p.login, `${p.login} is not a person`).not.toMatch(/\[bot\]$/);
      expect(p.login, `${p.login} is not a person`).not.toMatch(NOT_A_PERSON);
    }
  });

  it('gives every person what the avatar and the link need', () => {
    for (const p of data.contributors) {
      expect(typeof p.id, p.login).toBe('number');
      expect(p.url, p.login).toBe(`https://github.com/${p.login}`);
      expect(p.contributions, p.login).toBeGreaterThan(0);
      expect(p.repos.length, `${p.login} is credited on no repository`).toBeGreaterThan(0);
    }
  });

  it('lists each person once, most commits first', () => {
    const logins = data.contributors.map((p) => p.login);
    expect(new Set(logins).size).toBe(logins.length);

    const counts = data.contributors.map((p) => p.contributions);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });
});
