/**
 * The site's two faces, made available to sharp for the social cards.
 *
 * sharp renders SVG text through librsvg and fontconfig, and its bundled
 * FreeType does not read woff2 — the only format fontsource ships — so the
 * cards used to fall back to whatever sans the machine had. Here the same
 * files the site serves are decompressed to TTF in a temp directory, and a
 * fontconfig of our own points at nothing else:
 *
 *   - the cards look the same on every machine, system fonts or not;
 *   - the families get stable names at scan time, "SP Display" and "SP Mono",
 *     because the subset's own name ("Bricolage Grotesque 96pt ExtraBold") is
 *     an accident of how it was cut.
 *
 * Must run before sharp is imported: FONTCONFIG_FILE is read when fontconfig
 * initialises.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import wawoff2 from 'wawoff2';

const FACES = [
  { family: 'SP Display', pkg: 'bricolage-grotesque', file: 'bricolage-grotesque-latin-wght-normal' },
  { family: 'SP Mono', pkg: 'jetbrains-mono', file: 'jetbrains-mono-latin-wght-normal' },
];

export async function useProjectFonts(root) {
  const dir = join(tmpdir(), 'sp-night-fonts');
  mkdirSync(join(dir, 'fonts'), { recursive: true });

  const renames = [];
  for (const face of FACES) {
    const woff2 = readFileSync(
      join(root, 'node_modules/@fontsource-variable', face.pkg, 'files', `${face.file}.woff2`),
    );
    writeFileSync(join(dir, 'fonts', `${face.file}.ttf`), await wawoff2.decompress(woff2));
    renames.push(`  <match target="scan">
    <test name="file" compare="contains"><string>${face.file}</string></test>
    <edit name="family" mode="assign" binding="same"><string>${face.family}</string></edit>
  </match>`);
  }

  writeFileSync(
    join(dir, 'fonts.conf'),
    `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${join(dir, 'fonts')}</dir>
  <cachedir>${join(dir, 'cache')}</cachedir>
${renames.join('\n')}
</fontconfig>
`,
  );
  process.env.FONTCONFIG_FILE = join(dir, 'fonts.conf');
}
