# Wordfind

A multilingual word-search puzzle. Drag through letters in any straight line — horizontal, vertical, or diagonal, forward or reverse — to find the hidden words. Five languages: English, Spanish, French, German, and Turkish.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Scripts

- `npm run dev` — Vite dev server with HMR
- `npm run build` — type-check and produce a static bundle in `dist/`
- `npm run preview` — preview the production build
- `npm run type-check` — `tsc --noEmit`

## Stack

Vanilla TypeScript + Vite. No framework. The board is plain DOM; selection and "found" markers are rendered as an SVG overlay.

## Layout

```
src/
  main.ts     # bootstrap, render, pointer + selection logic
  grid.ts     # generator: places words in 8 directions, fills noise letters
  words.ts    # multilingual themed word pools
  styles.css  # palette, board, responsive layout
```

## License

MIT
