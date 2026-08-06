/**
 * The markdown side of a port page.
 *
 * A port's `install_guide` is prose the catalogue says cannot be derived —
 * Ghostty has to explain that its theme files carry no extension, eza has to
 * explain that a set `EZA_COLORS` overrides the file. The same string is what
 * the engine renders into the port's README, so the site renders it rather
 * than restating it in a shape of its own.
 *
 * Rendering goes through `@astrojs/markdown-remark`, which is the processor
 * Astro already uses for `.md` — so there is one dialect on this site, not two.
 * It is a dependency in name only: it is already in the tree as Astro's own.
 */
import { createMarkdownProcessor } from '@astrojs/markdown-remark';

export type GuideBlock =
  | { kind: 'prose'; md: string }
  | { kind: 'code'; lang: string; code: string };

const FENCE = /^```(\w*)\n([\s\S]*?)^```$/gm;

/**
 * Split a guide into prose and fenced code.
 *
 * The fences are pulled out before the markdown processor ever sees them so
 * each one can be rendered by CodeBlock, which carries the copy button the rest
 * of the site's snippets have. The alternative — rendering to HTML and then
 * operating on `<pre>` tags — is string surgery on generated markup.
 */
export function splitGuide(md: string): GuideBlock[] {
  const blocks: GuideBlock[] = [];
  let last = 0;

  for (const m of md.matchAll(FENCE)) {
    const prose = md.slice(last, m.index).trim();
    if (prose) blocks.push({ kind: 'prose', md: prose });
    blocks.push({ kind: 'code', lang: m[1] || 'text', code: m[2]!.trimEnd() });
    last = m.index + m[0].length;
  }

  const tail = md.slice(last).trim();
  if (tail) blocks.push({ kind: 'prose', md: tail });
  return blocks;
}

/**
 * GitHub's alert syntax, which remark-gfm does not know.
 *
 * `> [!NOTE]` is a blockquote whose first line is a marker. Left alone it
 * renders the literal text "[!NOTE]", which is how it reads on three of the
 * four port guides today. Twenty lines here beat a dependency, and the result
 * reuses the callout styling the site already has.
 */
function remarkAlerts() {
  return (tree: any) => {
    for (const node of tree.children ?? []) {
      if (node.type !== 'blockquote') continue;
      const first = node.children?.[0]?.children?.[0];
      if (first?.type !== 'text') continue;

      const match = /^\[!(\w+)\]\s*\n?/.exec(first.value);
      if (!match) continue;

      first.value = first.value.slice(match[0].length);
      node.data = {
        hName: 'aside',
        hProperties: { class: 'callout', 'data-kind': match[1]!.toLowerCase() },
      };
    }
  };
}

// One processor for the whole build. Constructing it per port is the kind of
// cost that only shows up once there are thirty of them.
let processor: ReturnType<typeof createMarkdownProcessor> | undefined;

const get = () =>
  (processor ??= createMarkdownProcessor({
    gfm: true,
    smartypants: true,
    // The site has no syntax highlighting anywhere — TerminalMock is coloured
    // by role, CodeBlock is plain. Loading shiki for one page would be both a
    // visual inconsistency and a large build-time cost.
    syntaxHighlight: false,
    remarkPlugins: [remarkAlerts],
  }));

/** Block-level markdown → HTML. */
export async function renderMd(md: string): Promise<string> {
  const { code } = await (await get()).render(md);
  return code;
}

/**
 * Inline markdown → HTML, with the wrapping paragraph removed.
 *
 * The catalogue's short fields are markdown fragments: a mapping key is
 * `` `palette = 0…15` ``, a gloss is "*laje* under the main text". The ports
 * page printed them raw, backticks and all.
 */
export async function inlineMd(text: string): Promise<string> {
  const html = (await renderMd(text)).trim();
  const only = /^<p>([\s\S]*)<\/p>$/.exec(html);
  return only && !only[1]!.includes('<p>') ? only[1]! : html;
}
