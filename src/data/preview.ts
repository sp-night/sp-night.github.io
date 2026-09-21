/**
 * The bridge between the catalogue's declarative preview and the palette.
 *
 * It is kept out of ports.ts on purpose: that module is a pure registry loader,
 * so the registry can be validated without a palette in hand. Everything here
 * needs both, and everything here can fail loudly — which is the point.
 *
 * Mirrors `internal/port/preview.go` in the engine, so the synthetic terminal
 * this site draws and the SVG the port repository ships say the same thing.
 */
import type { Preview, Span } from './ports';
import { type Flavor, flavors, keyVar, roleVar } from './palette';

const resolve = (f: Flavor, kind: 'r' | 'c', name: string): string => {
  if (kind === 'c') {
    const colour = f.colors[name];
    if (!colour) throw new Error(`preview text {c:${name}}: no such palette key`);
    return colour.hex;
  }
  const [group, role] = name.split('.');
  const hex = group && role ? f.roles[group]?.[role]?.hex : undefined;
  if (!hex) throw new Error(`preview text {r:${name}}: no such role`);
  return hex;
};

/**
 * Preview text for one flavour.
 *
 * `{flavor}` and `{label}` name the flavour; `{r:ui.bg}` and `{c:laje}` put the
 * *hex itself* into the fake session, which is how a mockup of `kitty
 * @ get-colors` can print the real background instead of an invented number.
 * A brace that is neither is left alone — shell snippets contain them.
 */
export const previewText = (text: string, f: Flavor): string =>
  text
    .replaceAll('{flavor}', f.id)
    .replaceAll('{label}', f.label)
    .replace(/\{([rc]):([^}]+)\}/g, (_, kind: 'r' | 'c', name: string) => resolve(f, kind, name));

/**
 * The swatch strip under a preview, as custom properties — shared by the
 * terminal mock and the port cards, so both draw the same colours in the same
 * order. Like `spanColor`, a name that does not resolve fails the build.
 */
export function swatchColors(preview: Preview): string[] {
  const { roles, keys } = preview.swatches;
  if (roles?.length) {
    return roles.map((r) => {
      const [group, role] = r.split('.');
      if (!group || !role || !flavors[0]!.roles[group]?.[role]) {
        throw new Error(`preview swatch "${r}" is not a role`);
      }
      return roleVar(group, role);
    });
  }
  return (keys ?? []).map((k) => {
    if (!flavors[0]!.colors[k]) throw new Error(`preview swatch "${k}" is not a palette key`);
    return keyVar(k);
  });
}

/**
 * The CSS colour for a span, always as a custom property so the mock retints
 * with the flavour switcher.
 *
 * This throws where `roleVar` would quietly return `currentColor`. A catalogue
 * that has outrun the vendored role layer must fail the build, not render a
 * grey mockup that nobody notices for a month.
 */
export function spanColor(s: Span): string {
  if (s.c) {
    if (!flavors[0]!.colors[s.c]) throw new Error(`preview span c: "${s.c}" is not a palette key`);
    return keyVar(s.c);
  }
  if (!s.r) throw new Error('preview span sets neither r nor c');
  const [group, role] = s.r.split('.');
  if (!group || !role || !flavors[0]!.roles[group]?.[role]) {
    throw new Error(`preview span r: "${s.r}" is not a role`);
  }
  return roleVar(group, role);
}
