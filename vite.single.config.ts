import { defineConfig } from 'vite';

/** One-chunk build used by scripts/make-single-file.mjs to produce a double-clickable HTML file. */
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist-single',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
        entryFileNames: 'game.js'
      }
    }
  }
});
