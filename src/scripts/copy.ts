/**
 * Click-to-copy for colour cards and code blocks.
 *
 * Colour cards resolve the live value of a CSS custom property, so the copied
 * hex always matches the flavour currently shown.
 */
const live = document.getElementById('copy-status');

function announce(text: string) {
  if (live) live.textContent = text;
}

async function copy(text: string, el: HTMLElement, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    el.classList.add('is-copied');
    announce(`${label} copied`);
    setTimeout(() => el.classList.remove('is-copied'), 1200);
  } catch {
    announce('Copy failed — your browser blocked clipboard access');
  }
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;

  const swatch = target?.closest<HTMLElement>('[data-copy-var]');
  if (swatch) {
    const prop = swatch.dataset.copyVar!;
    const value = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
    if (value) void copy(value, swatch, value);
    return;
  }

  const code = target?.closest<HTMLElement>('[data-copy-text]');
  if (code) void copy(code.dataset.copyText!, code, 'Snippet');
});
