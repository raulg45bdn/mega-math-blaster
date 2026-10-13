import { defineConfig } from 'vite';

/**
 * Build used for the public website. Output goes to docs/, which GitHub Pages
 * serves directly from the main branch. `base: './'` keeps every asset path
 * relative, so the site works from a project subpath like /mega-math-blaster/.
 */
export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  }
});
