import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    treeshake: true,
    clean: true,
    sourcemap: true,
    minify: false,
    external: ['react'],
    outDir: 'dist',
    esbuildOptions(options) {
      options.loader = {
        ...options.loader,
        '.css': 'text',
        '.woff': 'dataurl',
        '.woff2': 'dataurl',
      };
    },
  },
  {
    entry: { accessflow: 'src/cdn.ts' },
    format: ['iife'],
    globalName: 'AccessFlow',
    minify: true,
    sourcemap: true,
    outDir: 'dist/cdn',
    outExtension: () => ({ js: '.js' }),
    esbuildOptions(options) {
      options.loader = {
        ...options.loader,
        '.css': 'text',
        '.woff': 'dataurl',
        '.woff2': 'dataurl',
      };
    },
  },
]);
