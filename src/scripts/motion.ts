/**
 * Small motion helpers, all no-ops when the visitor asks for less motion.
 *
 *  1. `--sp-scroll` on <html>, updated on a rAF tick — used for the hero
 *     parallax without a scroll handler doing layout work.
 *  2. Reveal-on-scroll for anything tagged `.reveal`.
 *  3. The hero scene stops animating once it is off screen.
 *  4. Numbers tagged `data-count` count up when they are revealed.
 *  5. A page index tagged `data-toc` marks the section being read.
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

/*
 * The markup carries the final number, so without JS — or under reduced
 * motion, where this is never called — the fact is simply stated. The count
 * only starts once the card is revealed, while it is still fading in, so the
 * reset to zero is never seen.
 */
function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target) || target <= 0) return;
  const duration = 700 + Math.min(target, 60) * 8;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(step);
  };
  el.textContent = '0';
  requestAnimationFrame(step);
}

/*
 * The index marks the last section whose heading has passed the top third of
 * the screen. Runs regardless of reduced motion: it moves nothing, it only
 * says where you are.
 */
const toc = document.querySelector<HTMLElement>('[data-toc]');

if (toc && 'IntersectionObserver' in window) {
  // The ids sit on the headings; the section around each one is what is read.
  const pairs = Array.from(toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
    .map((a) => {
      const heading = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      return heading ? { a, area: (heading.closest('section') ?? heading) as Element } : null;
    })
    .filter((p): p is { a: HTMLAnchorElement; area: Element } => p !== null);
  const visible = new Set<Element>();

  const mark = () => {
    const current = pairs.find((p) => visible.has(p.area));
    if (!current) return; // between sections: keep the last one lit
    for (const { a } of pairs) {
      if (a === current.a) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    }
  };

  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      mark();
    },
    { rootMargin: '-20% 0px -60% 0px' },
  );
  pairs.forEach((p) => spy.observe(p.area));
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
          entry.target.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );
    targets.forEach((el) => io.observe(el));
  }
}
