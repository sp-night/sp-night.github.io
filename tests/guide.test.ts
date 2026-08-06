/**
 * The guide splitter, checked against the real guides.
 *
 * The split is regex work on fenced blocks, so the guard that matters is the
 * round trip: whatever comes out has to add back up to what went in. A fence
 * the regex mishandles would otherwise drop half a guide silently, and the page
 * would still build.
 */
import { describe, expect, it } from 'vitest';
import { inlineMd, renderMd, splitGuide } from '../src/data/guide';
import { ports } from '../src/data/ports';

describe('splitGuide', () => {
  it('loses nothing from a real guide', () => {
    for (const p of ports) {
      const rebuilt = splitGuide(p.install_guide)
        .map((b) => (b.kind === 'prose' ? b.md : `\`\`\`${b.lang}\n${b.code}\n\`\`\``))
        .join('\n\n');
      // Whitespace between blocks is normalised by design; the words are not.
      const words = (s: string) => s.replace(/\s+/g, ' ').trim();
      expect(words(rebuilt), p.slug).toBe(words(p.install_guide));
    }
  });

  it('finds the code every guide ships', () => {
    for (const p of ports) {
      const code = splitGuide(p.install_guide).filter((b) => b.kind === 'code');
      expect(code.length, `${p.slug} has no code block`).toBeGreaterThan(0);
      for (const b of code) {
        expect(b.kind === 'code' && b.code.includes('```'), `${p.slug} nested fence`).toBe(false);
      }
    }
  });

  it('leaves no fence marker in the prose', () => {
    for (const p of ports) {
      for (const b of splitGuide(p.install_guide)) {
        if (b.kind === 'prose') expect(b.md, p.slug).not.toContain('```');
      }
    }
  });
});

describe('rendering', () => {
  it('turns a GitHub alert into a callout, not the literal marker', async () => {
    const html = await renderMd('> [!NOTE]\n> kitty applies the last value it reads.');
    expect(html).toContain('class="callout"');
    expect(html).toContain('data-kind="note"');
    expect(html).not.toContain('[!NOTE]');
  });

  it('renders an ordinary blockquote as a blockquote', async () => {
    const html = await renderMd('> just a quote');
    expect(html).toContain('<blockquote>');
    expect(html).not.toContain('callout');
  });

  it('unwraps a single paragraph for inline fields', async () => {
    expect(await inlineMd('`palette = 0…15`')).toBe('<code>palette = 0…15</code>');
    expect(await inlineMd('*laje* under the main text')).toBe(
      '<em>laje</em> under the main text',
    );
  });

  it('renders every mapping cell in the catalogue without throwing', async () => {
    for (const p of ports) {
      for (const row of p.mapping) {
        for (const cell of [row.key, row.role, row.meaning ?? '']) {
          await expect(inlineMd(cell), `${p.slug}: ${cell}`).resolves.toBeTypeOf('string');
        }
      }
    }
  });
});
