/**
 * Two small motion helpers, both no-ops when the visitor asks for less motion.
 *
 *  1. `--sp-scroll` on <html>, updated on a rAF tick — used for the hero
 *     parallax without a scroll handler doing layout work.
 *  2. Reveal-on-scroll for anything tagged `.reveal`.
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
