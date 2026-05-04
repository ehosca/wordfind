// Word-search grid generator. Words are placed in 8 directions (4 axes × 2)
// and may overlap on matching letters. After real words are placed:
//
//   1. Sub-word decoys (length 2–4 substrings of placed words, excluding any
//      that match a real find-list word) are planted to create false trails.
//      The player's eye traces "TIG..." expecting TIGER and dead-ends because
//      it's actually just "TIG".
//
//   2. Empty cells are filled from the placed words' unique-letter pool — NOT
//      the full alphabet. The reason: with rare anchors like Z/Q/X scrubbed
//      out, the player can't visually skip "obviously not a word" regions.
//      Every cell looks plausible, so scanning slows down significantly.
//
// If a word can't be placed after MAX_TRIES random attempts we drop it.

export type Dir = readonly [number, number];

export const DIRECTIONS: Dir[] = [
  [ 0,  1], [ 0, -1],
  [ 1,  0], [-1,  0],
  [ 1,  1], [-1, -1],
  [ 1, -1], [-1,  1]
];

export interface Placement {
  word: string;
  letters: string[];
  row: number;
  col: number;
  dir: Dir;
  cells: Array<[number, number]>;
}

export interface Puzzle {
  size: number;
  cells: string[][];
  placements: Placement[];
}

const MAX_TRIES = 200;
const DECOY_MAX_TRIES = 80;
// How many decoys to aim for. The grid has ~size² cells; with 8 placed words
// occupying ~50 cells, we have plenty of room for 12 short decoys without
// dominating the layout.
const DECOY_TARGET_COUNT = 12;
const DECOY_MIN_LEN = 2;
const DECOY_MAX_LEN = 4;

function splitGraphemes(word: string): string[] {
  // For Turkish I/İ etc. each codepoint is a cell. Array.from handles the
  // common cases (no combining marks in our pools).
  return Array.from(word);
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
}

// Try to place a word at a random position/direction. Allows overlapping with
// existing letters when they match (so words can share cells). When
// requireNewCells > 0, the placement must contribute at least that many
// previously-empty cells — used to keep decoys from being placed entirely on
// top of an existing word (which would waste a slot without adding any new
// misleading sequence to the grid).
function tryPlace(
  cells: string[][],
  size: number,
  letters: string[],
  maxTries: number = MAX_TRIES,
  requireNewCells: number = 0
): Placement | null {
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]!;
    const [dr, dc] = dir;
    const len = letters.length;

    // Choose a starting cell such that the whole word fits in bounds.
    const minRow = dr < 0 ? len - 1 : 0;
    const maxRow = dr > 0 ? size - len : size - 1;
    const minCol = dc < 0 ? len - 1 : 0;
    const maxCol = dc > 0 ? size - len : size - 1;
    if (minRow > maxRow || minCol > maxCol) continue;

    const row = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
    const col = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));

    let ok = true;
    let newCellCount = 0;
    for (let i = 0; i < len; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = cells[r]![c];
      if (existing === '') {
        newCellCount++;
      } else if (existing !== letters[i]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (newCellCount < requireNewCells) continue;

    const placedCells: Array<[number, number]> = [];
    for (let i = 0; i < len; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      cells[r]![c] = letters[i]!;
      placedCells.push([r, c]);
    }
    return { word: letters.join(''), letters, row, col, dir, cells: placedCells };
  }
  return null;
}

// Build the set of decoy candidates: substrings of placed words, length 2–4,
// excluding any string that matches a real find-list word (would trigger a
// false-positive find via trySubmit's string-fallback match path).
function generateDecoyCandidates(
  placements: Placement[],
  realWords: Set<string>
): string[][] {
  const subs = new Set<string>();
  for (const p of placements) {
    const letters = p.letters;
    const maxLen = Math.min(DECOY_MAX_LEN, letters.length - 1);
    for (let len = DECOY_MIN_LEN; len <= maxLen; len++) {
      for (let start = 0; start + len <= letters.length; start++) {
        const sub = letters.slice(start, start + len).join('');
        if (realWords.has(sub)) continue;
        subs.add(sub);
      }
    }
  }
  return Array.from(subs).map(s => splitGraphemes(s));
}

export function generatePuzzle(
  size: number,
  words: string[],
  alphabet: string
): Puzzle {
  // Place longest words first — they're the hardest to fit.
  const sorted = [...words].sort((a, b) => b.length - a.length);
  const cells: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => '')
  );
  const placements: Placement[] = [];

  for (const word of sorted) {
    const letters = splitGraphemes(word);
    if (letters.length > size) continue;
    const placement = tryPlace(cells, size, letters);
    if (placement) placements.push(placement);
  }

  // Plant sub-word decoys. tryPlace's requireNewCells=1 guarantees each decoy
  // contributes at least one newly-filled cell, so we never "waste" a decoy
  // slot by placing it entirely on top of an existing word's letters.
  const realWords = new Set(placements.map(p => p.word));
  const decoyCandidates = generateDecoyCandidates(placements, realWords);
  shuffle(decoyCandidates);
  let decoysPlaced = 0;
  for (const decoy of decoyCandidates) {
    if (decoysPlaced >= DECOY_TARGET_COUNT) break;
    if (tryPlace(cells, size, decoy, DECOY_MAX_TRIES, 1)) decoysPlaced++;
  }

  // Fill empty cells from the placed-words letter pool. Falls back to the
  // full alphabet only in the degenerate case where nothing got placed.
  const placedLetters = new Set<string>();
  for (const p of placements) for (const ch of p.letters) placedLetters.add(ch);
  const fillPool = placedLetters.size > 0
    ? Array.from(placedLetters)
    : splitGraphemes(alphabet);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (cells[r]![c] === '') {
        cells[r]![c] = fillPool[Math.floor(Math.random() * fillPool.length)]!;
      }
    }
  }

  return { size, cells, placements };
}
