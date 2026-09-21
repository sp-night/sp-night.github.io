/**
 * Shared vector master for the inline brand, exported logos and app icons.
 * Geometry uses a 64-unit grid. Colours come from the active palette or CSS.
 * The compact version removes details that disappear at favicon sizes.
 */
export function markBody(colors, id = 'mark', compact = false) {
  const c = colors;
  return `<defs>
    <clipPath id="${id}-clip"><rect width="64" height="64" rx="14"/></clipPath>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
      <stop stop-color="${c.vao}"/>
      <stop offset=".48" stop-color="${c.laje}"/>
      <stop offset="1" stop-color="${c.temporal}"/>
    </linearGradient>
    <radialGradient id="${id}-horizon" cx=".62" cy="1" r=".85">
      <stop stop-color="${c.sodio}" stop-opacity=".86"/>
      <stop offset=".48" stop-color="${c.sodio}" stop-opacity=".32"/>
      <stop offset="1" stop-color="${c.sodio}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}-beacon">
      <stop stop-color="${c.brasa}" stop-opacity=".3"/>
      <stop offset="1" stop-color="${c.brasa}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g clip-path="url(#${id}-clip)">
    <rect width="64" height="64" fill="${c.vao}"/>
    <rect width="64" height="64" fill="url(#${id}-sky)"/>
    <rect width="64" height="64" fill="url(#${id}-horizon)"/>
    <path d="M0 49 C9 48 14 42 21 43 C30 44 35 51 43 47 C51 43 56 40 64 43 V64 H0Z" fill="${c.concreto}" opacity=".46"/>
    <path d="M0 58 C9 55 16 51 22 43 C26 37 28 34 32 34 C37 34 39 43 44 46 C48 49 51 42 55 43 C59 43 62 47 64 49 V64 H0Z" fill="${c.vao}"/>
    <path d="M29.8 35 L31.4 15 H32.6 L34.2 35" fill="none" stroke="${c.fg_dim}" stroke-width="${compact ? 1.25 : .9}" stroke-linejoin="round"/>
    <path d="M32 15 V11.5" stroke="${c.fg_dim}" stroke-width="1.2" stroke-linecap="round"/>
    ${compact ? '' : `<path d="M31.1 20 H32.9 M30.7 25 H33.3 M30.3 30 H33.7" fill="none" stroke="${c.brasa}" stroke-width="1.2"/>
    <path d="M31.1 20 L33.3 25 L30.3 30 L34 34" fill="none" stroke="${c.fg_dim}" stroke-width=".55" opacity=".65"/>
    <path d="M54.5 43 V38.5" stroke="${c.fg_dim}" stroke-width=".7" opacity=".65"/>
    <g fill="${c.sodio}" opacity=".7">
      <rect x="10" y="56.5" width="2.4" height=".8" rx=".4"/>
      <rect x="15" y="58" width="1.2" height=".8" rx=".4"/>
      <rect x="48" y="55.5" width="1.8" height=".8" rx=".4"/>
      <rect x="52" y="57" width="3" height=".8" rx=".4"/>
    </g>`}
    <circle cx="32" cy="11" r="5" fill="url(#${id}-beacon)"/>
    <circle cx="32" cy="11" r="${compact ? 1.65 : 1.25}" fill="${c.brasa}"/>
    <rect x=".5" y=".5" width="63" height="63" rx="13.5" fill="none" stroke="${c.fg_dim}" stroke-opacity=".12"/>
  </g>`.replace(/^[ \t]+$/gm, '');
}

export function markSvg(flavor, size = 64, compact = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="SP Night — Pico do Jaraguá at dusk">${markBody(flavor.colors, 'mark', compact)}</svg>`;
}
