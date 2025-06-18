// vite.config.js for SVECTOR SDK browser compatibility
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'dist/src/index.js',
      name: 'SVECTOR',
      fileName: (format) => `svector-sdk.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    target: 'es2020',
    minify: 'terser',
    sourcemap: true
  },
  define: {
    // Ensure Node.js globals don't cause issues in browser
    global: 'globalThis',
    process: 'globalThis.process'
  },
  optimizeDeps: {
    exclude: ['node:stream', 'node:buffer', 'node:crypto']
  },
  resolve: {
    alias: {
      // Provide browser-compatible alternatives
      'node:stream': 'stream-browserify',
      'node:buffer': 'buffer',
      'node:crypto': 'crypto-browserify',
      'stream': 'stream-browserify',
      'buffer': 'buffer',
      'crypto': 'crypto-browserify'
    }
  }
});
