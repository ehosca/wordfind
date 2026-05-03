import { defineConfig } from 'vite';

export default defineConfig({
  // Site is hosted at hosca.com/wordfind/ — base prefixes all asset URLs
  // (script src, CSS hrefs, etc.) so they resolve correctly under that
  // subpath instead of the server root. Local `npm run dev` honors this
  // too, so the dev URL is http://localhost:5173/wordfind/.
  base: '/wordfind/',
  server: {
    host: true
  }
});
