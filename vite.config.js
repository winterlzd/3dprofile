import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: { manualChunks: { three: ['three'] } },
    },
    // The shared Three.js engine is intentionally bundled for offline assets.
    chunkSizeWarningLimit: 650,
  },
});
