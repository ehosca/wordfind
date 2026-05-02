// Multilingual word pools. Each language has a label, an alphabet (used to
// fill empty cells with plausible noise letters), and a themed pool. Picking
// from a single theme keeps each puzzle visually coherent and the word list
// memorable.

export interface LanguagePack {
  code: string;
  label: string;
  alphabet: string;
  pools: Record<string, string[]>;
}

export const LANGUAGES: LanguagePack[] = [
  {
    code: 'en',
    label: 'English',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    pools: {
      animals: ['TIGER', 'EAGLE', 'WOLF', 'OTTER', 'HORSE', 'PANDA', 'SHARK', 'MOOSE', 'RABBIT', 'FALCON', 'LIZARD', 'BEAVER'],
      fruit:   ['APPLE', 'MANGO', 'PEACH', 'GRAPE', 'LEMON', 'MELON', 'CHERRY', 'BANANA', 'ORANGE', 'PAPAYA', 'GUAVA', 'PLUM']
    }
  },
  {
    code: 'es',
    label: 'Español',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    pools: {
      animales: ['TIGRE', 'AGUILA', 'LOBO', 'NUTRIA', 'CABALLO', 'PANDA', 'TIBURON', 'ALCE', 'CONEJO', 'HALCON', 'LAGARTO', 'CASTOR'],
      frutas:   ['MANZANA', 'MANGO', 'MELOCOTON', 'UVA', 'LIMON', 'MELON', 'CEREZA', 'PLATANO', 'NARANJA', 'PAPAYA', 'GUAYABA', 'CIRUELA']
    }
  },
  {
    code: 'fr',
    label: 'Français',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    pools: {
      animaux: ['TIGRE', 'AIGLE', 'LOUP', 'LOUTRE', 'CHEVAL', 'PANDA', 'REQUIN', 'ELAN', 'LAPIN', 'FAUCON', 'LEZARD', 'CASTOR'],
      fruits:  ['POMME', 'MANGUE', 'PECHE', 'RAISIN', 'CITRON', 'MELON', 'CERISE', 'BANANE', 'ORANGE', 'PAPAYE', 'GOYAVE', 'PRUNE']
    }
  },
  {
    code: 'de',
    label: 'Deutsch',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    pools: {
      tiere:   ['TIGER', 'ADLER', 'WOLF', 'OTTER', 'PFERD', 'PANDA', 'HAI', 'ELCH', 'HASE', 'FALKE', 'EIDECHSE', 'BIBER'],
      fruechte:['APFEL', 'MANGO', 'PFIRSICH', 'TRAUBE', 'ZITRONE', 'MELONE', 'KIRSCHE', 'BANANE', 'ORANGE', 'PAPAYA', 'GUAVE', 'PFLAUME']
    }
  },
  {
    code: 'tr',
    label: 'Türkçe',
    alphabet: 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ',
    pools: {
      hayvanlar: ['KAPLAN', 'KARTAL', 'KURT', 'SAMUR', 'AT', 'PANDA', 'KÖPEKBALIĞI', 'GEYİK', 'TAVŞAN', 'ŞAHİN', 'KERTENKELE', 'KUNDUZ'],
      meyveler:  ['ELMA', 'MANGO', 'ŞEFTALİ', 'ÜZÜM', 'LİMON', 'KAVUN', 'KİRAZ', 'MUZ', 'PORTAKAL', 'PAPAYA', 'GUAVA', 'ERİK']
    }
  }
];

export function pickPool(lang: LanguagePack): { theme: string; words: string[] } {
  const themes = Object.keys(lang.pools);
  const theme = themes[Math.floor(Math.random() * themes.length)]!;
  return { theme, words: lang.pools[theme]! };
}
