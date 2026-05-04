// Multilingual word pools. Each language has a label, an alphabet (used to
// fill empty cells with plausible noise letters), and themed pools. Picking
// from a single theme keeps each puzzle visually coherent and the word list
// memorable.
//
// Each pool aims for ~30 words across a range of lengths (3–10 letters mostly,
// with a few longer ones that only fit on larger grids). main.ts filters words
// longer than the chosen grid size before sampling 8 — so adding longer words
// is harmless on small grids; they just get skipped.

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
      animals: [
        'TIGER', 'EAGLE', 'WOLF', 'OTTER', 'HORSE', 'PANDA', 'SHARK', 'MOOSE',
        'RABBIT', 'FALCON', 'LIZARD', 'BEAVER', 'BEAR', 'DEER', 'DUCK', 'FROG',
        'GOAT', 'HAWK', 'LION', 'SEAL', 'SWAN', 'ZEBRA', 'CAMEL', 'KOALA',
        'SNAKE', 'MONKEY', 'RACCOON', 'GORILLA', 'LEOPARD', 'BUFFALO', 'GIRAFFE',
        'DOLPHIN', 'PENGUIN', 'ELEPHANT', 'TURTLE', 'BADGER', 'OWL', 'CROW'
      ],
      fruit: [
        'APPLE', 'MANGO', 'PEACH', 'GRAPE', 'LEMON', 'MELON', 'CHERRY', 'BANANA',
        'ORANGE', 'PAPAYA', 'GUAVA', 'PLUM', 'PEAR', 'KIWI', 'LIME', 'FIG',
        'DATE', 'BERRY', 'OLIVE', 'COCONUT', 'APRICOT', 'AVOCADO', 'RASPBERRY',
        'BLUEBERRY', 'PINEAPPLE', 'NECTARINE', 'POMEGRANATE', 'TANGERINE',
        'STRAWBERRY', 'BLACKBERRY'
      ],
      colors: [
        'RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'PURPLE', 'PINK', 'BROWN',
        'BLACK', 'WHITE', 'GRAY', 'GOLD', 'SILVER', 'BEIGE', 'CORAL', 'IVORY',
        'AMBER', 'CRIMSON', 'SCARLET', 'MAROON', 'TURQUOISE', 'INDIGO', 'VIOLET',
        'TEAL', 'NAVY', 'OLIVE', 'PLUM', 'PEACH', 'LILAC', 'CYAN'
      ],
      countries: [
        'CANADA', 'BRAZIL', 'FRANCE', 'JAPAN', 'INDIA', 'CHINA', 'EGYPT', 'SPAIN',
        'ITALY', 'GERMANY', 'MEXICO', 'CHILE', 'PERU', 'KENYA', 'NIGERIA',
        'GREECE', 'POLAND', 'TURKEY', 'IRELAND', 'NORWAY', 'SWEDEN', 'FINLAND',
        'PORTUGAL', 'AUSTRIA', 'HUNGARY', 'CROATIA', 'BELGIUM', 'THAILAND',
        'VIETNAM', 'MOROCCO'
      ]
    }
  },
  {
    code: 'es',
    label: 'Español',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    pools: {
      animales: [
        'TIGRE', 'AGUILA', 'LOBO', 'NUTRIA', 'CABALLO', 'PANDA', 'TIBURON', 'ALCE',
        'CONEJO', 'HALCON', 'LAGARTO', 'CASTOR', 'OSO', 'CIERVO', 'PATO', 'RANA',
        'CABRA', 'LEON', 'FOCA', 'CISNE', 'CEBRA', 'CAMELLO', 'KOALA', 'SERPIENTE',
        'MONO', 'MAPACHE', 'GORILA', 'LEOPARDO', 'BUFALO', 'JIRAFA', 'DELFIN',
        'PINGUINO', 'ELEFANTE', 'TORTUGA', 'TEJON', 'BUHO', 'CUERVO'
      ],
      frutas: [
        'MANZANA', 'MANGO', 'MELOCOTON', 'UVA', 'LIMON', 'MELON', 'CEREZA', 'PLATANO',
        'NARANJA', 'PAPAYA', 'GUAYABA', 'CIRUELA', 'PERA', 'KIWI', 'LIMA', 'HIGO',
        'DATIL', 'BAYA', 'ACEITUNA', 'COCO', 'ALBARICOQUE', 'AGUACATE', 'FRAMBUESA',
        'ARANDANO', 'PINA', 'NECTARINA', 'GRANADA', 'MANDARINA', 'FRESA', 'MORA'
      ],
      colores: [
        'ROJO', 'AZUL', 'VERDE', 'AMARILLO', 'NARANJA', 'MORADO', 'ROSA', 'MARRON',
        'NEGRO', 'BLANCO', 'GRIS', 'DORADO', 'PLATA', 'BEIGE', 'CORAL', 'MARFIL',
        'AMBAR', 'CARMESI', 'ESCARLATA', 'GRANATE', 'TURQUESA', 'INDIGO', 'VIOLETA',
        'TURQUI', 'OLIVA', 'CIRUELA', 'MELOCOTON', 'LILA', 'AZULON', 'OCRE'
      ],
      paises: [
        'CANADA', 'BRASIL', 'FRANCIA', 'JAPON', 'INDIA', 'CHINA', 'EGIPTO',
        'ESPANA', 'ITALIA', 'ALEMANIA', 'MEXICO', 'CHILE', 'PERU', 'KENIA',
        'NIGERIA', 'GRECIA', 'POLONIA', 'TURQUIA', 'IRLANDA', 'NORUEGA', 'SUECIA',
        'FINLANDIA', 'PORTUGAL', 'AUSTRIA', 'HUNGRIA', 'CROACIA', 'BELGICA',
        'TAILANDIA', 'VIETNAM', 'MARRUECOS'
      ]
    }
  },
  {
    code: 'fr',
    label: 'Français',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    pools: {
      animaux: [
        'TIGRE', 'AIGLE', 'LOUP', 'LOUTRE', 'CHEVAL', 'PANDA', 'REQUIN', 'ELAN',
        'LAPIN', 'FAUCON', 'LEZARD', 'CASTOR', 'OURS', 'CERF', 'CANARD', 'CHEVRE',
        'LION', 'PHOQUE', 'CYGNE', 'ZEBRE', 'CHAMEAU', 'KOALA', 'SERPENT', 'SINGE',
        'GORILLE', 'LEOPARD', 'BUFFLE', 'GIRAFE', 'DAUPHIN', 'MANCHOT', 'ELEPHANT',
        'TORTUE', 'BLAIREAU', 'HIBOU', 'CORBEAU'
      ],
      fruits: [
        'POMME', 'MANGUE', 'PECHE', 'RAISIN', 'CITRON', 'MELON', 'CERISE', 'BANANE',
        'ORANGE', 'PAPAYE', 'GOYAVE', 'PRUNE', 'POIRE', 'KIWI', 'FIGUE', 'DATTE',
        'BAIE', 'OLIVE', 'NOIX', 'COCO', 'ABRICOT', 'AVOCAT', 'FRAMBOISE',
        'MYRTILLE', 'ANANAS', 'NECTARINE', 'GRENADE', 'MANDARINE', 'FRAISE', 'MURE'
      ],
      couleurs: [
        'ROUGE', 'BLEU', 'VERT', 'JAUNE', 'ORANGE', 'VIOLET', 'ROSE', 'BRUN',
        'NOIR', 'BLANC', 'GRIS', 'OR', 'ARGENT', 'BEIGE', 'CORAIL', 'IVOIRE',
        'AMBRE', 'CRAMOISI', 'ECARLATE', 'GRENAT', 'TURQUOISE', 'INDIGO', 'POURPRE',
        'OLIVE', 'PRUNE', 'PECHE', 'LILAS', 'CYAN', 'OCRE', 'MARRON'
      ],
      pays: [
        'CANADA', 'BRESIL', 'FRANCE', 'JAPON', 'INDE', 'CHINE', 'EGYPTE', 'ESPAGNE',
        'ITALIE', 'ALLEMAGNE', 'MEXIQUE', 'CHILI', 'PEROU', 'KENYA', 'NIGERIA',
        'GRECE', 'POLOGNE', 'TURQUIE', 'IRLANDE', 'NORVEGE', 'SUEDE', 'FINLANDE',
        'PORTUGAL', 'AUTRICHE', 'HONGRIE', 'CROATIE', 'BELGIQUE', 'THAILANDE',
        'VIETNAM', 'MAROC'
      ]
    }
  },
  {
    code: 'de',
    label: 'Deutsch',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    pools: {
      tiere: [
        'TIGER', 'ADLER', 'WOLF', 'OTTER', 'PFERD', 'PANDA', 'HAI', 'ELCH',
        'HASE', 'FALKE', 'EIDECHSE', 'BIBER', 'BAR', 'REH', 'ENTE', 'FROSCH',
        'ZIEGE', 'LOWE', 'ROBBE', 'SCHWAN', 'ZEBRA', 'KAMEL', 'KOALA', 'SCHLANGE',
        'AFFE', 'WASCHBAR', 'GORILLA', 'LEOPARD', 'BUFFEL', 'GIRAFFE', 'DELFIN',
        'PINGUIN', 'ELEFANT', 'SCHILDKROTE', 'DACHS', 'EULE', 'RABE'
      ],
      fruechte: [
        'APFEL', 'MANGO', 'PFIRSICH', 'TRAUBE', 'ZITRONE', 'MELONE', 'KIRSCHE',
        'BANANE', 'ORANGE', 'PAPAYA', 'GUAVE', 'PFLAUME', 'BIRNE', 'KIWI',
        'LIMETTE', 'FEIGE', 'DATTEL', 'BEERE', 'OLIVE', 'KOKOSNUSS', 'APRIKOSE',
        'AVOCADO', 'HIMBEERE', 'BLAUBEERE', 'ANANAS', 'NEKTARINE', 'GRANATAPFEL',
        'MANDARINE', 'ERDBEERE', 'BROMBEERE'
      ],
      farben: [
        'ROT', 'BLAU', 'GRUN', 'GELB', 'ORANGE', 'LILA', 'ROSA', 'BRAUN',
        'SCHWARZ', 'WEISS', 'GRAU', 'GOLD', 'SILBER', 'BEIGE', 'KORALLE', 'ELFENBEIN',
        'BERNSTEIN', 'KARMIN', 'SCHARLACH', 'WEINROT', 'TURKIS', 'INDIGO', 'VIOLETT',
        'OLIVE', 'PFLAUME', 'PFIRSICH', 'FLIEDER', 'CYAN', 'OCKER', 'MAROON'
      ],
      laender: [
        'KANADA', 'BRASILIEN', 'FRANKREICH', 'JAPAN', 'INDIEN', 'CHINA', 'AGYPTEN',
        'SPANIEN', 'ITALIEN', 'DEUTSCHLAND', 'MEXIKO', 'CHILE', 'PERU', 'KENIA',
        'NIGERIA', 'GRIECHENLAND', 'POLEN', 'TURKEI', 'IRLAND', 'NORWEGEN',
        'SCHWEDEN', 'FINNLAND', 'PORTUGAL', 'OSTERREICH', 'UNGARN', 'KROATIEN',
        'BELGIEN', 'THAILAND', 'VIETNAM', 'MAROKKO'
      ]
    }
  },
  {
    code: 'tr',
    label: 'Türkçe',
    alphabet: 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ',
    pools: {
      hayvanlar: [
        'KAPLAN', 'KARTAL', 'KURT', 'SAMUR', 'AT', 'PANDA', 'KÖPEKBALIĞI', 'GEYİK',
        'TAVŞAN', 'ŞAHİN', 'KERTENKELE', 'KUNDUZ', 'AYI', 'KEÇİ', 'KURBAĞA',
        'ASLAN', 'FOK', 'KUĞU', 'ZEBRA', 'DEVE', 'KOALA', 'YILAN', 'MAYMUN',
        'RAKUN', 'GORİL', 'LEOPAR', 'BİZON', 'ZÜRAFA', 'YUNUS', 'PENGUEN', 'FİL',
        'ÖRDEK', 'KAPLUMBAĞA', 'PORSUK', 'BAYKUŞ', 'KARGA'
      ],
      meyveler: [
        'ELMA', 'MANGO', 'ŞEFTALİ', 'ÜZÜM', 'LİMON', 'KAVUN', 'KİRAZ', 'MUZ',
        'PORTAKAL', 'PAPAYA', 'GUAVA', 'ERİK', 'ARMUT', 'KİVİ', 'MİSKET', 'İNCİR',
        'HURMA', 'ZEYTİN', 'KAYISI', 'AVOKADO', 'AHUDUDU', 'YABANMERSİNİ', 'ANANAS',
        'NEKTARİN', 'NAR', 'MANDALİNA', 'ÇİLEK', 'BÖĞÜRTLEN', 'KARPUZ', 'DUT'
      ],
      renkler: [
        'KIRMIZI', 'MAVİ', 'YEŞİL', 'SARI', 'TURUNCU', 'MOR', 'PEMBE', 'KAHVERENGİ',
        'SİYAH', 'BEYAZ', 'GRİ', 'ALTIN', 'GÜMÜŞ', 'BEJ', 'MERCAN', 'FİLDİŞİ',
        'KEHRİBAR', 'KIZIL', 'BORDO', 'TURKUAZ', 'ÇİVİT', 'EFLATUN', 'ZEYTİN',
        'ŞEFTALİ', 'LEYLAK', 'CAMGÖBEĞİ', 'OKER', 'LACİVERT', 'GÜVERCİN', 'KREM'
      ],
      ulkeler: [
        'KANADA', 'BREZİLYA', 'FRANSA', 'JAPONYA', 'HİNDİSTAN', 'ÇİN', 'MISIR',
        'İSPANYA', 'İTALYA', 'ALMANYA', 'MEKSİKA', 'ŞİLİ', 'PERU', 'KENYA',
        'NİJERYA', 'YUNANİSTAN', 'POLONYA', 'TÜRKİYE', 'İRLANDA', 'NORVEÇ',
        'İSVEÇ', 'FİNLANDİYA', 'PORTEKİZ', 'AVUSTURYA', 'MACARİSTAN', 'HIRVATİSTAN',
        'BELÇİKA', 'TAYLAND', 'VİETNAM', 'FAS'
      ]
    }
  }
];

export function pickPool(lang: LanguagePack): { theme: string; words: string[] } {
  const themes = Object.keys(lang.pools);
  const theme = themes[Math.floor(Math.random() * themes.length)]!;
  return { theme, words: lang.pools[theme]! };
}
