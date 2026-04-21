import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    charset: 'utf8',
  },
  build: {
    // Split large vendor chunks so Android WebView doesn't choke on one big file
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'seeds-tolkien': [
            './src/data/seeds/quenya.js',
            './src/data/seeds/sindarin.js',
          ],
          'seeds-hbo': [
            './src/data/seeds/dothraki.js',
            './src/data/seeds/high_valyrian.js',
            './src/data/seeds/klingon.js',
            './src/data/seeds/atlantean.js',
          ],
          'seeds-classical': [
            './src/data/seeds/latin.js',
            './src/data/seeds/ancient_greek.js',
            './src/data/seeds/ancient_hebrew.js',
          ],
          'seeds-historical': [
            './src/data/seeds/old_english.js',
            './src/data/seeds/old_norse.js',
            './src/data/seeds/gaelic.js',
            './src/data/seeds/navajo.js',
            './src/data/seeds/norwegian.js',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
