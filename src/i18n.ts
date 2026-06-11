// UI strings per language. `themes` maps pool keys from words.ts (which stay
// ASCII-safe) to display labels (which don't have to). `allFound` uses a
// {time} placeholder.

export interface UIStrings {
  tagline: string;
  find: string;
  language: string;
  size: string;
  newGame: string;
  words: string;
  allFound: string;
  switchToLight: string;
  switchToDark: string;
  themes: Record<string, string>;
}

export const STRINGS: Record<string, UIStrings> = {
  en: {
    tagline: 'find the hidden words',
    find: 'Find',
    language: 'Language',
    size: 'Size',
    newGame: 'New Game',
    words: 'words',
    allFound: 'All words found in {time}!',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    themes: {
      animals: 'Animals',
      fruit: 'Fruit',
      colors: 'Colors',
      countries: 'Countries'
    }
  },
  es: {
    tagline: 'encuentra las palabras ocultas',
    find: 'Encuentra',
    language: 'Idioma',
    size: 'Tamaño',
    newGame: 'Nueva partida',
    words: 'palabras',
    allFound: '¡Todas las palabras encontradas en {time}!',
    switchToLight: 'Cambiar a modo claro',
    switchToDark: 'Cambiar a modo oscuro',
    themes: {
      animales: 'Animales',
      frutas: 'Frutas',
      colores: 'Colores',
      paises: 'Países'
    }
  },
  fr: {
    tagline: 'trouvez les mots cachés',
    find: 'À trouver',
    language: 'Langue',
    size: 'Taille',
    newGame: 'Nouvelle partie',
    words: 'mots',
    allFound: 'Tous les mots trouvés en {time} !',
    switchToLight: 'Passer en mode clair',
    switchToDark: 'Passer en mode sombre',
    themes: {
      animaux: 'Animaux',
      fruits: 'Fruits',
      couleurs: 'Couleurs',
      pays: 'Pays'
    }
  },
  de: {
    tagline: 'finde die versteckten Wörter',
    find: 'Finden',
    language: 'Sprache',
    size: 'Größe',
    newGame: 'Neues Spiel',
    words: 'Wörter',
    allFound: 'Alle Wörter in {time} gefunden!',
    switchToLight: 'Zum hellen Modus wechseln',
    switchToDark: 'Zum dunklen Modus wechseln',
    themes: {
      tiere: 'Tiere',
      fruechte: 'Früchte',
      farben: 'Farben',
      laender: 'Länder'
    }
  },
  tr: {
    tagline: 'gizli kelimeleri bul',
    find: 'Bul',
    language: 'Dil',
    size: 'Boyut',
    newGame: 'Yeni Oyun',
    words: 'kelime',
    allFound: 'Tüm kelimeler {time} içinde bulundu!',
    switchToLight: 'Açık moda geç',
    switchToDark: 'Koyu moda geç',
    themes: {
      hayvanlar: 'Hayvanlar',
      meyveler: 'Meyveler',
      renkler: 'Renkler',
      ulkeler: 'Ülkeler'
    }
  }
};
