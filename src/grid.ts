// Word-search grid generator. Words are placed in 8 directions (4 axes × 2)
// and may overlap on matching letters. Empty cells are filled with random
// noise from the language's alphabet. If a word can't be placed after
// MAX_TRIES random attempts we drop it — the caller decides whether to retry
// or accept a shorter list.

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

function splitGraphemes(word: string): string[] {
  // For Turkish I/İ etc. each codepoint is a cell. Array.from handles the
  // common cases (no combining marks in our pools).
  return Array.from(word);
}

function tryPlace(
  cells: string[][],
  size: number,
  letters: string[]
): Placement | null {
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
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
    for (let i = 0; i < len; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = cells[r]![c];
      if (existing !== '' && existing !== letters[i]) { ok = false; break; }
    }
    if (!ok) continue;

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

  const alpha = splitGraphemes(alphabet);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (cells[r]![c] === '') {
        cells[r]![c] = alpha[Math.floor(Math.random() * alpha.length)]!;
      }
    }
  }

  return { size, cells, placements };
}
