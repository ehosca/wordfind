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

// Visual difficulty isn't uniform across the 8 directions. Left-to-right and
// top-to-bottom both match natural reading order — a long word laid out that
// way reads off the grid almost immediately. Diagonals and reversed
// orientations require deliberate effort to scan.
//
// We bias the direction sample by word length: short words (< 6 letters)
// stay roughly uniform (no benefit to forcing tiny words into hard slots),
// while longer words get strongly pushed away from L→R / T→B and toward
// diagonals + reversed. Each entry is the multiplicative weight applied to
// that direction, ordered to match DIRECTIONS above.
function directionWeights(wordLen: number): number[] {
  // Tiered weights: easy directions shrink fast as words get longer.
  const ltr = wordLen >= 8 ? 0.20 : wordLen >= 6 ? 0.45 : 0.85;
  const ttb = wordLen >= 8 ? 0.55 : wordLen >= 6 ? 0.80 : 0.95;
  // Reversed (R→L, B→T) sit between easy and diagonal — still axis-aligned
  // but the eye doesn't auto-trace them.
  const rev = 1.0;
  // Diagonals are the hardest to scan, so we promote them — but only mildly.
  // Over-promoting produces all-diagonal layouts, which are just as list-like
  // as all-horizontal ones (parallel diagonals that never cross).
  const diag = 1.45;
  return [
    ltr,  // [ 0,  1] right
    rev,  // [ 0, -1] left
    ttb,  // [ 1,  0] down
    rev,  // [-1,  0] up
    diag, // [ 1,  1] down-right
    diag, // [-1, -1] up-left
    diag, // [ 1, -1] down-left
    diag  // [-1,  1] up-right
  ];
}

function pickWeightedDirection(wordLen: number): Dir {
  const weights = directionWeights(wordLen);
  let total = 0;
  for (const w of weights) total += w;
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return DIRECTIONS[i]!;
  }
  return DIRECTIONS[DIRECTIONS.length - 1]!;
}

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
// How many full real-word layouts to generate and score before accepting one.
// Each is microseconds; the loop almost always breaks early on the first pass.
const MAX_LAYOUT_ATTEMPTS = 120;
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
    const dir = pickWeightedDirection(letters.length);
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

// Axis class of a placement: 'H' horizontal, 'V' vertical, 'D' diagonal.
function axisOf(dir: Dir): 'H' | 'V' | 'D' {
  if (dir[0] === 0) return 'H';
  if (dir[1] === 0) return 'V';
  return 'D';
}

// Longest run of same-axis words occupying consecutive rows (for H) or columns
// (for V). A run of 3+ reads as a stacked, list-like block — the exact failure
// we're guarding against.
function maxConsecutiveRun(lines: number[]): number {
  if (lines.length === 0) return 0;
  const uniq = Array.from(new Set(lines)).sort((a, b) => a - b);
  let best = 1, run = 1;
  for (let i = 1; i < uniq.length; i++) {
    run = uniq[i]! === uniq[i - 1]! + 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

export interface LayoutScore {
  pass: boolean;
  diagonals: number;
  maxParallelRun: number;
  crossings: number;
  sameAxisMax: number;
}

// Score an emergent layout against the "doesn't look like a word list" rules.
// `diagQuota` lets the caller relax the diagonal floor on tight grids.
export function scoreLayout(
  placements: Placement[],
  diagQuota?: number
): LayoutScore {
  const n = placements.length;
  const axes = placements.map(p => axisOf(p.dir));
  const diagonals = axes.filter(a => a === 'D').length;

  // Same-axis counts.
  const counts = { H: 0, V: 0, D: 0 };
  for (const a of axes) counts[a]++;
  const sameAxisMax = Math.max(counts.H, counts.V, counts.D);

  // Stacking: H words on consecutive rows, V words on consecutive cols.
  const hRows: number[] = [];
  const vCols: number[] = [];
  for (const p of placements) {
    const a = axisOf(p.dir);
    if (a === 'H') hRows.push(p.row);
    else if (a === 'V') vCols.push(p.col);
  }
  const maxParallelRun = Math.max(maxConsecutiveRun(hRows), maxConsecutiveRun(vCols));

  // Crossings: cells covered by 2+ placements.
  const cover = new Map<string, number>();
  for (const p of placements) {
    for (const [r, c] of p.cells) {
      const k = `${r},${c}`;
      cover.set(k, (cover.get(k) ?? 0) + 1);
    }
  }
  let crossings = 0;
  for (const v of cover.values()) if (v >= 2) crossings++;

  const reqDiag = diagQuota ?? Math.ceil(n * 0.25);
  const pass =
    diagonals >= reqDiag &&
    maxParallelRun < 3 &&
    sameAxisMax <= Math.ceil(n * 0.6) &&
    crossings >= 1;

  return { pass, diagonals, maxParallelRun, crossings, sameAxisMax };
}

// One full real-word placement pass on a fresh grid.
function placeRealWords(
  size: number,
  words: string[]
): { cells: string[][]; placements: Placement[] } {
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
  return { cells, placements };
}

// Composite quality used to pick the best candidate when none fully pass
// (tight grids). Reward crossings and a few diagonals; punish the list-like
// extremes — long parallel runs, one axis dominating, and zero crossings.
function layoutQuality(s: LayoutScore, n: number): number {
  return (
    s.crossings * 4 +
    Math.min(s.diagonals, Math.ceil(n * 0.5)) * 2 -
    s.maxParallelRun * 3 -
    Math.max(0, s.sameAxisMax - Math.ceil(n * 0.6)) * 5 -
    (s.crossings === 0 ? 6 : 0)
  );
}

export function generatePuzzle(
  size: number,
  words: string[],
  alphabet: string
): Puzzle {
  // Generate several full layouts and keep the first that passes the quality
  // rules — or the best-scored one if none do (tight grids). This guards
  // against emergent "stacked word list" layouts that per-word direction
  // weighting can't prevent.
  let cells: string[][] = [];
  let placements: Placement[] = [];
  let bestQuality = -Infinity;

  for (let attempt = 0; attempt < MAX_LAYOUT_ATTEMPTS; attempt++) {
    const cand = placeRealWords(size, words);
    const s = scoreLayout(cand.placements);
    const q = layoutQuality(s, cand.placements.length) + (s.pass ? 1000 : 0);
    if (q > bestQuality) {
      bestQuality = q;
      cells = cand.cells;
      placements = cand.placements;
    }
    if (s.pass) break;
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
