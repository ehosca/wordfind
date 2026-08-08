import { LANGUAGES, pickPool, type LanguagePack } from './words';
import { generatePuzzle, type Placement, type Puzzle } from './grid';
import { STRINGS, type UIStrings } from './i18n';

const TARGET_WORD_COUNT = 8;
const GRID_SIZE = 10;
const SVG_NS = 'http://www.w3.org/2000/svg';

// Soft, muted palette — each found word gets the next colour. Kept dark
// enough that the white letters on found dots hold ≥3:1 contrast.
const FOUND_COLORS = [
  '#5E8A67', // sage
  '#A85B40', // terracotta
  '#4E76A6', // dusty blue
  '#8F6F2A', // ochre
  '#7E5C8E', // plum
  '#3F827A', // teal
  '#B25E45', // coral
  '#67699B', // lavender
];

// Brighter variants reserved for confetti, which carries no text.
const CONFETTI_COLORS = [
  '#7EA886', '#C2785C', '#6B8DB5', '#C4A24E',
  '#9B7BAA', '#5B9E94', '#D4826A', '#8B8DB5',
];

const $timer = document.getElementById('timer') as HTMLDivElement;
const $grid = document.getElementById('grid') as HTMLDivElement;
const $lines = document.getElementById('lines') as unknown as SVGSVGElement;
const $list = document.getElementById('wordlist') as HTMLUListElement;
const $lang = document.getElementById('lang') as HTMLSelectElement;
const $newgame = document.getElementById('newgame') as HTMLButtonElement;
const $status = document.getElementById('status') as HTMLDivElement;
const $board = document.querySelector('.board') as HTMLDivElement;
const $themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
const $tagline = document.getElementById('tagline') as HTMLParagraphElement;
const $listTheme = document.getElementById('list-theme') as HTMLSpanElement;
const $listCount = document.getElementById('list-count') as HTMLSpanElement;
const $labelLang = document.getElementById('label-lang') as HTMLSpanElement;
const $winOverlay = document.getElementById('win-overlay') as HTMLDivElement;
const $winTitle = document.getElementById('win-title') as HTMLDivElement;
const $winTime = document.getElementById('win-time') as HTMLDivElement;
const $winSub = document.getElementById('win-sub') as HTMLDivElement;
const $playAgain = document.getElementById('play-again') as HTMLButtonElement;
const $confetti = document.getElementById('confetti') as HTMLDivElement;

type Cell = [number, number];

interface State {
  puzzle: Puzzle;
  cellEls: HTMLDivElement[][];
  found: Set<string>;
  foundGroups: Array<{ cells: Cell[]; group: SVGGElement; color: string }>;
  remaining: Placement[];
  startCell: Cell | null;
  selecting: Cell[] | null;
  selectGroup: SVGGElement | null;
  selEls: HTMLDivElement[];
  peeking: Cell[] | null;
  peekGroup: SVGGElement | null;
  peekEls: HTMLDivElement[];
  colorIndex: number;
}

let state: State | null = null;
let revealTimers: ReturnType<typeof setTimeout>[] = [];
let currentThemeLabel = '';

// ---------- timer ----------

let timerStart = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let timerRunning = false;

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function startTimer() {
  stopTimer();
  timerStart = Date.now();
  timerRunning = true;
  $timer.textContent = '0:00';
  timerInterval = setInterval(() => {
    if (!timerRunning) return;
    $timer.textContent = formatTime(Date.now() - timerStart);
  }, 250);
}

function stopTimer(): string {
  timerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  const elapsed = formatTime(Date.now() - timerStart);
  $timer.textContent = elapsed;
  return elapsed;
}

// ---------- i18n ----------

const LANG_KEY = 'wordfind-lang';
let strings: UIStrings = STRINGS['en']!;

function applyI18n(code: string) {
  strings = STRINGS[code] ?? STRINGS['en']!;
  document.documentElement.lang = code;
  $tagline.textContent = strings.tagline;
  $listTheme.textContent = strings.find;
  $labelLang.textContent = strings.language;
  $newgame.textContent = strings.newGame;
  $playAgain.textContent = strings.playAgain;
  const theme = (document.documentElement.dataset.theme as Theme) ?? 'light';
  $themeToggle.setAttribute('aria-label', theme === 'dark' ? strings.switchToLight : strings.switchToDark);
}

// ---------- setup ----------

function populateLanguages() {
  for (const lang of LANGUAGES) {
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = lang.label;
    $lang.appendChild(opt);
  }
}

function newGame() {
  const lang = LANGUAGES.find(l => l.code === $lang.value) ?? LANGUAGES[0]!;
  const { theme, words } = pickPool(lang);

  const candidates = words.filter(w => Array.from(w).length <= GRID_SIZE);
  shuffle(candidates);
  const chosen = candidates.slice(0, TARGET_WORD_COUNT);

  const puzzle = generatePuzzle(GRID_SIZE, chosen, lang.alphabet);
  renderBoard(puzzle, lang, theme);
  revealBoard(puzzle, lang);
}

function revealBoard(puzzle: Puzzle, lang: LanguagePack) {
  if (!state) return;

  // Clear any in-flight reveal from a previous game.
  for (const t of revealTimers) clearTimeout(t);
  revealTimers = [];

  const alphabet = Array.from(lang.alphabet);
  const pick = () => alphabet[Math.floor(Math.random() * alphabet.length)]!;

  const STAGGER = 32;     // per diagonal step (r + c)
  const TICK = 75;        // ms between letter changes per cell
  const MIN_TICKS = 5;
  const MAX_TICKS = 9;

  $grid.classList.add('revealing');

  // Each tick is one full flap: the current letter rotates down out of view,
  // the new letter takes its place at the midpoint, then rotates up into
  // place. Driven by the Web Animations API so the compositor handles it
  // without any layout/reflow work on the main thread.
  function flap(glyph: HTMLElement, newChar: string) {
    // Swap the character at the rotational midpoint, when the glyph is
    // edge-on and effectively invisible.
    const swap = setTimeout(() => { glyph.textContent = newChar; }, TICK * 0.5);
    revealTimers.push(swap);

    glyph.animate(
      [
        { transform: 'rotateX(0deg)',   opacity: 1,   offset: 0,
          easing: 'cubic-bezier(0.55, 0, 0.9, 0.4)' },
        { transform: 'rotateX(-90deg)', opacity: 0.1, offset: 0.5 },
        { transform: 'rotateX(90deg)',  opacity: 0.1, offset: 0.5001,
          easing: 'cubic-bezier(0.1, 0.6, 0.4, 1)' },
        { transform: 'rotateX(0deg)',   opacity: 1,   offset: 1 }
      ],
      { duration: TICK, fill: 'none' }
    );
  }

  let maxEnd = 0;
  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      const glyph = state.cellEls[r]![c]!.querySelector('.glyph') as HTMLElement;
      const final = puzzle.cells[r]![c]!;
      const ticks = MIN_TICKS + Math.floor(Math.random() * (MAX_TICKS - MIN_TICKS + 1));
      const startDelay = r * STAGGER + Math.floor(Math.random() * 30);
      const end = startDelay + ticks * TICK;
      if (end > maxEnd) maxEnd = end;

      // Prime the cell with a random letter so the user never sees the final
      // letter before the animation kicks in.
      glyph.textContent = pick();

      for (let i = 0; i < ticks; i++) {
        const last = i === ticks - 1;
        const nextChar = last ? final : pick();
        const t = setTimeout(() => flap(glyph, nextChar), startDelay + i * TICK);
        revealTimers.push(t);
      }
    }
  }

  const done = setTimeout(() => $grid.classList.remove('revealing'), maxEnd + TICK);
  revealTimers.push(done);
}

function renderBoard(puzzle: Puzzle, lang: LanguagePack, theme: string) {
  $grid.style.gridTemplateColumns = `repeat(${puzzle.size}, 1fr)`;
  $grid.style.gridTemplateRows = `repeat(${puzzle.size}, 1fr)`;
  // Cell font-size scales off board width / column count (see .cell in CSS).
  $grid.style.setProperty('--cols', String(puzzle.size));
  $grid.innerHTML = '';
  $lines.innerHTML = '';
  $board.classList.remove('celebrating');

  const cellEls: HTMLDivElement[][] = [];
  for (let r = 0; r < puzzle.size; r++) {
    cellEls[r] = [];
    for (let c = 0; c < puzzle.size; c++) {
      const el = document.createElement('div');
      el.className = 'cell';
      el.dataset.row = String(r);
      el.dataset.col = String(c);
      const glyph = document.createElement('span');
      glyph.className = 'glyph';
      glyph.textContent = puzzle.cells[r]![c]!;
      el.appendChild(glyph);
      $grid.appendChild(el);
      cellEls[r]![c] = el;
    }
  }

  // Build word list with dot indicators.
  $list.innerHTML = '';
  for (const p of puzzle.placements) {
    const li = document.createElement('li');
    li.dataset.word = p.word;

    const dot = document.createElement('span');
    dot.className = 'dot';
    li.appendChild(dot);

    const wordText = document.createElement('span');
    wordText.className = 'word-text';
    wordText.textContent = p.word;
    li.appendChild(wordText);

    $list.appendChild(li);
  }

  $status.classList.remove('win');
  const themeLabel = strings.themes[theme] ?? theme;
  currentThemeLabel = themeLabel;
  $status.textContent = `${lang.label} · ${themeLabel} · ${puzzle.placements.length} ${strings.words}`;
  $listTheme.textContent = themeLabel;
  $listCount.textContent = `0/${puzzle.placements.length}`;
  $winOverlay.hidden = true;
  $confetti.innerHTML = '';
  startTimer();

  state = {
    puzzle,
    cellEls,
    found: new Set(),
    foundGroups: [],
    remaining: [...puzzle.placements],
    startCell: null,
    selecting: null,
    selectGroup: null,
    selEls: [],
    peeking: null,
    peekGroup: null,
    peekEls: [],
    colorIndex: 0
  };

  alignGrid();
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
}

// ---------- geometry ----------

function eq(a: Cell, b: Cell): boolean { return a[0] === b[0] && a[1] === b[1]; }

function cellAt(x: number, y: number): Cell | null {
  const hit = document.elementFromPoint(x, y) as HTMLElement | null;
  // Pointer may land on the inner glyph span — walk up to the .cell.
  const el = hit?.closest('.cell') as HTMLElement | null;
  if (!el) return null;
  return [parseInt(el.dataset.row!, 10), parseInt(el.dataset.col!, 10)];
}

// Straight-line cells from a to b. Returns null unless the vector is
// horizontal, vertical, or 45° diagonal.
function lineCells(a: Cell, b: Cell): Cell[] | null {
  const dr = b[0] - a[0];
  const dc = b[1] - a[1];
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = Math.sign(dr);
  const sc = Math.sign(dc);
  const out: Cell[] = [];
  for (let i = 0; i <= steps; i++) out.push([a[0] + sr * i, a[1] + sc * i]);
  return out;
}

// Vertical centring of the letters, measured rather than assumed.
//
// .glyph is a 1cap-tall inline-block (see CSS), which puts the cap box and
// the box the cell centres in the same place — but only in engines that
// honour cap units in line-height. WebKit is not guaranteed to, so instead
// of trusting it, probe where the baseline actually lands inside the glyph
// box and correct whatever is left over.
//
// On top of that, the visible gap above the first row and below the last one
// depends on which glyphs landed there: a cedilla (Ş, Ç) dips below the
// baseline and eats the bottom gap, a dotted or accented cap (İ, Ü, Ö) rises
// past the caps and eats the top one.
//
// Both corrections are identical for every cell, so they ride on the grid as
// a single offset and nothing inside the grid moves relative to anything else.
let inkCtx: CanvasRenderingContext2D | null | undefined;
let $probe: HTMLElement | null = null;

function metricsProbe(): HTMLElement {
  if (!$probe || !$probe.isConnected) {
    $probe = document.createElement('div');
    $probe.className = 'cell metrics-probe';
    $probe.setAttribute('aria-hidden', 'true');
    // The empty <i> has no line boxes of its own, so an inline-block of zero
    // height reports its box on the text baseline — in every engine.
    $probe.innerHTML = '<span class="glyph">H<i></i></span>';
    $grid.appendChild($probe);
  }
  return $probe;
}

function alignGrid(): void {
  if (!state) return;
  const { size, cells } = state.puzzle;

  const probe = metricsProbe();
  const glyph = probe.querySelector('.glyph') as HTMLElement;
  const box = glyph.getBoundingClientRect();
  const baselineOffset = probe.querySelector('i')!.getBoundingClientRect().top - box.top;
  if (!box.height) return;

  if (inkCtx === undefined) inkCtx = document.createElement('canvas').getContext('2d');
  if (!inkCtx) return;

  const cs = getComputedStyle(glyph);
  inkCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

  const capHeight = CSS.supports('height', '1cap')
    ? box.height
    : inkCtx.measureText('H').actualBoundingBoxAscent;

  // Centre the cap box within the glyph box the cell already centres.
  let nudge = (box.height + capHeight) / 2 - baselineOffset;

  // Then even out the ink that pokes past the cap box on the outer rows.
  let overshoot = 0;  // ink rising above the cap box on the first row
  let descent = 0;    // ink dropping below the baseline on the last row
  for (const ch of cells[0]!) {
    overshoot = Math.max(overshoot, inkCtx.measureText(ch).actualBoundingBoxAscent - capHeight);
  }
  for (const ch of cells[size - 1]!) {
    descent = Math.max(descent, inkCtx.measureText(ch).actualBoundingBoxDescent);
  }
  nudge -= (descent - overshoot) / 2;

  $grid.style.setProperty('--grid-nudge', `${nudge.toFixed(2)}px`);
}

function cellCenter(r: number, c: number): { x: number; y: number } {
  const cell = state!.cellEls[r]![c]!.getBoundingClientRect();
  const svg = $lines.getBoundingClientRect();
  return {
    x: cell.left + cell.width / 2 - svg.left,
    y: cell.top + cell.height / 2 - svg.top
  };
}

function dotRadius(): number {
  if (!state) return 16;
  return state.cellEls[0]![0]!.getBoundingClientRect().width * 0.42;
}

// ---------- rendering ----------

function buildPathGroup(
  cells: Cell[],
  variant: 'selecting' | 'found' | 'peeking',
  color?: string
): SVGGElement {
  const g = document.createElementNS(SVG_NS, 'g') as SVGGElement;
  g.setAttribute('class', variant);
  const r = dotRadius();
  const lineWidth = r * 0.7;

  // Connectors first so dots paint over the joins.
  for (let i = 0; i + 1 < cells.length; i++) {
    const a = cellCenter(cells[i]![0], cells[i]![1]);
    const b = cellCenter(cells[i + 1]![0], cells[i + 1]![1]);
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(a.x));
    line.setAttribute('y1', String(a.y));
    line.setAttribute('x2', String(b.x));
    line.setAttribute('y2', String(b.y));
    line.setAttribute('stroke-width', String(lineWidth));
    if (color) line.style.stroke = color;
    g.appendChild(line);
  }

  for (const [cr, cc] of cells) {
    const p = cellCenter(cr, cc);
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx', String(p.x));
    dot.setAttribute('cy', String(p.y));
    dot.setAttribute('r', String(r));
    if (color) {
      dot.style.stroke = color;
      dot.style.fill = color;
    }
    g.appendChild(dot);
  }

  return g;
}

function setSelectedCells(cells: Cell[]) {
  if (!state) return;
  for (const el of state.selEls) el.classList.remove('in-sel');
  state.selEls = cells.map(([r, c]) => state!.cellEls[r]![c]!);
  for (const el of state.selEls) el.classList.add('in-sel');
}

function paintSelection(cells: Cell[]) {
  if (!state) return;
  if (state.selectGroup) state.selectGroup.remove();
  state.selectGroup = null;
  setSelectedCells(cells);
  if (cells.length === 0) return;
  const g = buildPathGroup(cells, 'selecting');
  $lines.appendChild(g);
  state.selectGroup = g;
}

// Press-and-hold a word in the list to outline it on the board. Purely a
// hint — nothing is marked found, and it disappears on release.
function paintPeek(cells: Cell[] | null) {
  if (!state) return;
  if (state.peekGroup) {
    state.peekGroup.remove();
    state.peekGroup = null;
  }
  for (const el of state.peekEls) el.classList.remove('in-peek');
  state.peekEls = [];
  state.peeking = cells;
  if (!cells) return;
  const g = buildPathGroup(cells, 'peeking');
  $lines.appendChild(g);
  state.peekGroup = g;
  state.peekEls = cells.map(([r, c]) => state!.cellEls[r]![c]!);
  for (const el of state.peekEls) el.classList.add('in-peek');
}

function redrawLines() {
  if (!state) return;
  for (const fg of state.foundGroups) {
    fg.group.remove();
    fg.group = buildPathGroup(fg.cells, 'found', fg.color);
    $lines.appendChild(fg.group);
  }
  if (state.selecting) paintSelection(state.selecting);
  if (state.peeking) paintPeek(state.peeking);
}

// ---------- match logic ----------

function readPath(cells: Cell[]): string {
  return cells.map(([r, c]) => state!.puzzle.cells[r]![c]!).join('');
}

function pathMatchesPlacement(path: Cell[], p: Placement): boolean {
  if (path.length !== p.cells.length) return false;
  let fwd = true, rev = true;
  for (let i = 0; i < path.length; i++) {
    if (!eq(path[i]!, p.cells[i]!)) fwd = false;
    if (!eq(path[i]!, p.cells[p.cells.length - 1 - i]!)) rev = false;
    if (!fwd && !rev) return false;
  }
  return fwd || rev;
}

function nextColor(): string {
  if (!state) return FOUND_COLORS[0]!;
  const c = FOUND_COLORS[state.colorIndex % FOUND_COLORS.length]!;
  state.colorIndex++;
  return c;
}

function trySubmit(cells: Cell[]): boolean {
  if (!state || cells.length < 2) return false;
  let match: Placement | undefined;
  for (const p of state.remaining) {
    if (pathMatchesPlacement(cells, p)) { match = p; break; }
  }
  if (!match) {
    const fwd = readPath(cells);
    const rev = readPath([...cells].reverse());
    for (const p of state.remaining) {
      if (p.word === fwd || p.word === rev) { match = p; break; }
    }
  }
  if (!match) return false;

  state.found.add(match.word);
  state.remaining = state.remaining.filter(p => p !== match);
  $listCount.textContent = `${state.found.size}/${state.puzzle.placements.length}`;

  // Pick the next colour from the palette.
  const color = nextColor();

  const persisted: Cell[] = [...cells];
  const g = buildPathGroup(persisted, 'found', color);
  $lines.appendChild(g);
  state.foundGroups.push({ cells: persisted, group: g, color });

  for (const [r, c] of persisted) {
    const el = state.cellEls[r]![c]!;
    el.classList.add('flash', 'in-found');
    setTimeout(() => el.classList.remove('flash'), 400);
  }

  // Mark the word in the sidebar/pill list.
  const li = $list.querySelector(`li[data-word="${match.word}"]`);
  if (li) {
    li.classList.add('found');
    const dot = li.querySelector('.dot') as HTMLElement | null;
    if (dot) {
      dot.style.backgroundColor = color;
      dot.style.borderColor = color;
    }
    // Light tint for mobile pill background.
    (li as HTMLElement).style.setProperty('--found-tint', color + '20');
  }

  // Win!
  if (state.remaining.length === 0) {
    const elapsed = stopTimer();
    $status.textContent = strings.allFound.replace('{time}', elapsed);
    $status.classList.add('win');
    $board.classList.add('celebrating');
    showWin(elapsed);
  }
  return true;
}

function missFeedback(cells: Cell[]) {
  if (!state) return;
  for (const [r, c] of cells) {
    const el = state.cellEls[r]![c]!;
    el.classList.add('miss');
    setTimeout(() => el.classList.remove('miss'), 300);
  }
}

// ---------- win celebration ----------

function showWin(elapsed: string) {
  if (!state) return;
  $winTitle.textContent = strings.winTitle;
  $winTime.textContent = elapsed;
  $winSub.textContent = `${currentThemeLabel} · ${state.puzzle.placements.length} ${strings.words}`;
  $playAgain.textContent = strings.playAgain;
  $winOverlay.hidden = false;
  spawnConfetti();
}

function spawnConfetti() {
  $confetti.innerHTML = '';
  const fallHeight = $board.clientHeight + 30;
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('span');
    p.className = 'confetti-piece';
    p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length]!;
    p.style.left = `${Math.random() * 100}%`;
    const w = 5 + Math.random() * 5;
    p.style.width = `${w}px`;
    p.style.height = `${w * 1.6}px`;
    $confetti.appendChild(p);
    const spin = 360 + Math.random() * 420;
    p.animate(
      [
        { transform: 'translateY(-20px) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${fallHeight * 0.9}px) rotate(${spin * 0.9}deg)`, opacity: 1, offset: 0.9 },
        { transform: `translateY(${fallHeight}px) rotate(${spin}deg)`, opacity: 0 }
      ],
      {
        duration: 1300 + Math.random() * 900,
        delay: Math.random() * 350,
        easing: 'cubic-bezier(0.25, 0.4, 0.6, 1)',
        fill: 'both'
      }
    );
  }
  setTimeout(() => { $confetti.innerHTML = ''; }, 2800);
}

// ---------- pointer handlers ----------

function attachPointerHandlers() {
  $grid.addEventListener('pointerdown', onPointerDown);
  $grid.addEventListener('pointermove', onPointerMove);
  $grid.addEventListener('pointerup', onPointerUp);
  $grid.addEventListener('pointercancel', onPointerUp);
}

// Peek: pointer capture on the <li> keeps the release ours even if the
// finger slides off the pill, and stops the drag from reaching the grid.
function attachPeekHandlers() {
  $list.addEventListener('pointerdown', e => {
    if (!state) return;
    const li = (e.target as Element).closest('li[data-word]') as HTMLElement | null;
    if (!li || li.classList.contains('found')) return;
    const placement = state.puzzle.placements.find(p => p.word === li.dataset.word);
    if (!placement) return;
    try { li.setPointerCapture(e.pointerId); } catch { /* capture is best-effort */ }
    li.classList.add('peeking');
    paintPeek(placement.cells);
    e.preventDefault();
  });

  const endPeek = () => {
    for (const li of $list.querySelectorAll('li.peeking')) li.classList.remove('peeking');
    if (state?.peeking) paintPeek(null);
  };
  document.addEventListener('pointerup', endPeek);
  document.addEventListener('pointercancel', endPeek);
  // A long press on touch would otherwise pop the context menu mid-hint.
  $list.addEventListener('contextmenu', e => e.preventDefault());
}

function onPointerDown(e: PointerEvent) {
  if (!state) return;
  const cell = cellAt(e.clientX, e.clientY);
  if (!cell) return;
  state.startCell = cell;
  state.selecting = [cell];
  paintSelection(state.selecting);
  (e.target as Element).setPointerCapture?.(e.pointerId);
  e.preventDefault();
}

function onPointerMove(e: PointerEvent) {
  if (!state || !state.startCell) return;
  const cell = cellAt(e.clientX, e.clientY);
  if (!cell) return;
  const line = lineCells(state.startCell, cell);
  if (!line) return;
  state.selecting = line;
  paintSelection(line);
}

function onPointerUp(_e: PointerEvent) {
  if (!state) return;
  const sel = state.selecting;
  state.selecting = null;
  state.startCell = null;
  setSelectedCells([]);
  if (sel && sel.length > 1) {
    if (!trySubmit(sel)) missFeedback(sel);
  }
  if (state.selectGroup) {
    state.selectGroup.remove();
    state.selectGroup = null;
  }
}

// ---------- theme ----------

type Theme = 'light' | 'dark';
const THEME_KEY = 'wordfind-theme';
const META_COLOR_LIGHT = '#f6f4ee';
const META_COLOR_DARK = '#16140f';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? META_COLOR_DARK : META_COLOR_LIGHT);
  $themeToggle.setAttribute('aria-label', theme === 'dark' ? strings.switchToLight : strings.switchToDark);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ?? (prefersDark ? 'dark' : 'light'));
}

$themeToggle.addEventListener('click', () => {
  const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

// ---------- boot ----------

initTheme();
populateLanguages();
const savedLang = localStorage.getItem(LANG_KEY);
if (savedLang && LANGUAGES.some(l => l.code === savedLang)) $lang.value = savedLang;
applyI18n($lang.value);
attachPointerHandlers();
attachPeekHandlers();
window.addEventListener('resize', () => {
  // Font size tracks board width, so the ink offsets scale with it.
  alignGrid();
  redrawLines();
});
// Fallback metrics until Inter lands; remeasure once it has.
document.fonts?.ready.then(alignGrid);
$newgame.addEventListener('click', newGame);
$playAgain.addEventListener('click', newGame);
$lang.addEventListener('change', () => {
  localStorage.setItem(LANG_KEY, $lang.value);
  applyI18n($lang.value);
  newGame();
});
newGame();
