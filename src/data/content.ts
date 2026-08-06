/**
 * Editorial copy for the site — separate from src/data/palette.ts, which holds
 * colour *data* only.
 *
 * Everything here is a human decision, not a derived value: the reason each
 * flavour exists, and the São Paulo referent behind each colour name. Page
 * titles and ledes live in the pages themselves, next to the markup they
 * describe.
 */
/** Flavour ids, spelled out here so this module has no runtime dependency on the palette. */
export type FlavorId = 'noite' | 'garoa' | 'jaragua';

/**
 * English rendering of the Portuguese `meaning` glosses in palette.json — the
 * São Paulo referent behind each colour name.
 */
export const colorMeaningEn: Record<string, string> = {
  vao: 'the deepest recess — the free span under the MASP, a well of shadow',
  laje: 'the default surface — a concrete slab, the ground plane of everything',
  concreto: 'panels, cards and bars — exposed concrete',
  vidro: 'selection and elevation — glass reflecting the street',
  fiacao: 'borders and dividers — overhead wiring cutting across the sky',
  fg_vivo: 'lit text — terminal bright white, bold text',
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
  /** The story: where the name comes from, what it is trying to feel like. */
  story: { pt: string; en: string };
}

export const flavorCopy: Record<FlavorId, FlavorCopy> = {
  noite: {
    story: {
      pt: 'A cidade às 3h. O escuro azul-violeta do tokyodark, e o poste de sódio queimando quente por cima.',
      en: 'The city at 3 a.m. A blue-violet dark, with the sodium street lamp burning warm on top of it.',
    },
  },

  garoa: {
    story: {
      pt: 'A mesma janela, vista através do chuvisco. Cinza chapado — a garoa não esfria a cidade, ela desbota.',
      en: 'The same window, seen through the drizzle. Flat grey — the garoa does not cool the city down, it fades it out.',
    },
  },

  jaragua: {
    story: {
      pt: 'A mesma noite, vista do ponto mais alto da cidade. Superfícies quase pretas, com a mata deixada para os acentos — e a torre vermelha e branca acesa no topo.',
      en: 'The same night, seen from the highest point in the city. Near-black surfaces, with the forest left to the accents — and the red-and-white tower lit at the summit.',
    },
  },
};
