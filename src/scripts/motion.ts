/**
 * Small motion helpers, all no-ops when the visitor asks for less motion.
 *
 *  1. `--sp-scroll` on <html>, updated on a rAF tick — used for the hero
 *     parallax without a scroll handler doing layout work.
 *  2. Reveal-on-scroll for anything tagged `.reveal`.
 *  3. The hero scene stops animating once it is off screen.
 */
const calm = matchMedia('(prefers-reduced-motion: reduce)');

// Marks that JS is live, so `.reveal` only hides content we can bring back.
document.documentElement.classList.add('js');

if (!calm.matches) {
  let ticking = false;

  const update = () => {
    document.documentElement.style.setProperty('--sp-scroll', String(window.scrollY));
    ticking = false;
  };

  addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

/*
 * The skyline runs a few dozen infinite animations — beacons, rain, the wheel,
 * the plane — and they kept running while the reader was down in the footer.
 * `html.is-scene-off` pauses them all (global.css) from the moment the hero
 * leaves the viewport until it comes back.
 */
const scene = document.querySelector<HTMLElement>('[data-scene]');

if (scene && !calm.matches && 'IntersectionObserver' in window) {
  new IntersectionObserver(
    ([entry]) => {
      document.documentElement.classList.toggle('is-scene-off', !entry!.isIntersecting);
    },
    { rootMargin: '80px 0px' },
  ).observe(scene);
}

const targets = document.querySelectorAll<HTMLElement>('.reveal');

if (targets.length) {
  if (calm.matches || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );
    targets.forEach((el) => io.observe(el));
  }
}
