import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: true,
      strict: true
    }),
    prerender: {
      handleHttpError: ({ path, message }) => {
        // Ignore missing favicon
        if (path === '/favicon.ico') {
          return;
        }
        throw new Error(message);
      }
    }
  }
};

export default config;
