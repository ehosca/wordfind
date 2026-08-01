// UI strings per language. `themes` maps pool keys from words.ts (which stay
// ASCII-safe) to display labels (which don't have to). `allFound` uses a
// {time} placeholder.

export interface UIStrings {
  tagline: string;
  find: string;
  language: string;
  newGame: string;
  words: string;
  allFound: string;
  winTitle: string;
  playAgain: string;
  switchToLight: string;
  switchToDark: string;
  themes: Record<string, string>;
}

export const STRINGS: Record<string, UIStrings> = {
  en: {
    tagline: 'find the hidden words',
    find: 'Find',
    language: 'Language',
    newGame: 'New Game',
    words: 'words',
    allFound: 'All words found in {time}!',
    winTitle: 'Puzzle complete!',
    playAgain: 'Play Again',
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
    newGame: 'Nueva partida',
    words: 'palabras',
    allFound: '¡Todas las palabras encontradas en {time}!',
    winTitle: '¡Puzle completado!',
    playAgain: 'Jugar de nuevo',
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
    newGame: 'Nouvelle partie',
    words: 'mots',
    allFound: 'Tous les mots trouvés en {time} !',
    winTitle: 'Grille terminée !',
    playAgain: 'Rejouer',
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
    newGame: 'Neues Spiel',
    words: 'Wörter',
    allFound: 'Alle Wörter in {time} gefunden!',
    winTitle: 'Rätsel gelöst!',
    playAgain: 'Nochmal spielen',
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
    newGame: 'Yeni Oyun',
    words: 'kelime',
    allFound: 'Tüm kelimeler {time} içinde bulundu!',
    winTitle: 'Bulmaca tamamlandı!',
    playAgain: 'Tekrar Oyna',
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
