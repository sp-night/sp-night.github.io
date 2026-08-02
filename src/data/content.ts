/**
 * Editorial copy for the site — separate from src/data/palette.ts, which holds
 * colour *data* only.
 *
 * Everything here is a human decision, not a derived value. Page promises and
 * the reason each flavour exists live in this one file so they can be rewritten
 * without touching markup.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * STATUS: awaiting the author's words.
 *
 * The Portuguese `story` lines below are Rogerio's own, carried over from the
 * lab's palette file. The English is my translation, and `tagline` /
 * `whenToUse` are placeholders I wrote to hold the shape — they are marked
 * TODO and should be replaced, not inherited.
 *
 * `jaragua.story` is now FACTUALLY WRONG: it describes surfaces "rotated toward
 * the green of dense forest", which was true before the v2 repaint made them
 * near-black. It must be rewritten before it is shown anywhere.
 * ─────────────────────────────────────────────────────────────────────────────
 */
/** Flavour ids, spelled out here so this module has no runtime dependency on the palette. */
export type FlavorId = 'noite' | 'garoa' | 'jaragua';

/**
 * English rendering of the Portuguese `meaning` glosses in palette.json — the
 * São Paulo referent behind each colour name. Translations of the author's
 * words; open to rewriting.
 */
export const colorMeaningEn: Record<string, string> = {
  vao: 'the deepest recess — the free span under the MASP, a well of shadow',
  laje: 'the default surface — a concrete slab, the ground plane of everything',
  concreto: 'panels, cards and bars — exposed concrete',
  vidro: 'selection and elevation — glass reflecting the street',
  fiacao: 'borders and dividers — overhead wiring cutting across the sky',
  fg: 'primary text',
  fg_dim: 'secondary text and comments',
  fg_muted: 'disabled text, ornaments',
  brasa: 'red — the MASP, brake lights on Avenida Paulista',
  sodio: 'orange — the sodium street lamp that turns the whole city this colour',
  taxi: 'yellow — traffic lights, taxis, a worn-out crosswalk',
  ibira: 'green — Ibirapuera park, a green light',
  estaiada: 'turquoise — the Ponte Estaiada lit above the Pinheiros river',
  sereno: 'cyan — the small hours’ damp air, a cold neon sign',
  marginal: 'blue — the Marginal expressway, the metro, the highway sign',
  temporal: 'purple — the sky right before the storm breaks',
  brasa_vivo: 'live ember — terminal bright red, bold text',
  taxi_vivo: 'lit taxi — terminal bright yellow',
  ibira_vivo: 'green light — terminal bright green',
  sereno_vivo: 'lit sign — terminal bright cyan',
  marginal_vivo: 'lit sign — terminal bright blue',
  temporal_vivo: 'lightning — terminal bright magenta',
};

export interface FlavorCopy {
  /** One line, shown under the flavour name. */
  tagline: string;
  /** The story: where the name comes from, what it is trying to feel like. */
  story: { pt: string; en: string };
  /** Who it is for and when to reach for it rather than another flavour. */
  whenToUse: string;
  /** Set false once the author has signed off on the text above. */
  todo: boolean;
}

export const flavorCopy: Record<FlavorId, FlavorCopy> = {
  noite: {
    tagline: 'TODO — the author has not written this yet',
    story: {
      pt: 'A cidade às 3h. O escuro azul-violeta do tokyodark, e o poste de sódio queimando quente por cima.',
      en: 'The city at 3 a.m. A blue-violet dark, with the sodium street lamp burning warm on top of it.',
    },
    whenToUse: 'TODO — the author has not written this yet',
    todo: true,
  },

  garoa: {
    tagline: 'TODO — the author has not written this yet',
    story: {
      pt: 'A mesma janela, vista através do chuvisco. Cinza chapado — a garoa não esfria a cidade, ela desbota.',
      en: 'The same window, seen through the drizzle. Flat grey — the garoa does not cool the city down, it fades it out.',
    },
    whenToUse: 'TODO — the author has not written this yet',
    todo: true,
  },

  jaragua: {
    tagline: 'TODO — the author has not written this yet',
    story: {
      // OUTDATED: written for the old green-tinted surfaces, which no longer exist.
      pt: 'A mesma noite, vista do ponto mais alto da cidade. O escuro do noite girado para o verde da mata fechada — e a torre vermelha e branca acesa no topo.',
      en: 'The same night, seen from the highest point in the city. Near-black surfaces, with the forest left to the accents — and the red-and-white tower lit at the summit.',
    },
    whenToUse: 'TODO — the author has not written this yet',
    todo: true,
  },
};

export interface PageCopy {
  /** Browser tab and OG title (the layout appends the site name). */
  title: string;
  /** Meta description and OG description. */
  description: string;
  /** Small mono label above the heading. */
  eyebrow: string;
  /** The h1. */
  heading: string;
  /** The paragraph under the heading. */
  lede: string;
  todo: boolean;
}

export const pages = {
  home: {
    title: '',
    description:
      'A dark colour scheme with São Paulo as its reference: the sodium street lamp, exposed concrete, the free span of the MASP, the drizzle before the rain.',
    eyebrow: 'a dark theme with São Paulo as its reference',
    heading: 'The sodium lamp turns the whole city this colour.',
    lede: 'Exposed concrete, the free span of the MASP, the drizzle before the rain. Three dark flavours built on one rule: every colour pairing is measured before it ships, never eyeballed.',
    todo: true,
  },

  palette: {
    title: 'Palette',
    description:
      'Twenty-two colours across three dark flavours, each named after something in São Paulo — surfaces, text, accents and the terminal bright pairs.',
    eyebrow: 'palette',
    heading: 'Twenty-two colours, three ways to look at the same city',
    lede: 'Every flavour is dark by decision, not by omission. They differ in hue and chroma, never in brightness — switch between them with the control in the header and the whole site follows.',
    todo: true,
  },

  spec: {
    title: 'Spec',
    description:
      'What each colour in SP Night is for, and the rules any port has to follow: contrast thresholds, accent separation and how syntax roles are assigned.',
    eyebrow: 'specification',
    heading: 'What each colour is for',
    lede: 'SP Night is one file of colours, a layer of names on top of it, and a generator that writes the theme for every app.',
    todo: false,
  },

  contribute: {
    title: 'Contribute',
    description:
      'How SP Night is built and how to add a port: what a template is, which rules it has to follow, and what a submission needs.',
    eyebrow: 'contribute',
    heading: 'How to help build this',
    lede: 'SP Night is moving out of a personal lab and into a real organisation. Some of what follows already works locally; some of it is being packaged right now.',
    todo: false,
  },
} satisfies Record<string, PageCopy>;
