import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  loader: {
    '.glsl': 'text',
    '.vert': 'text',
    '.frag': 'text',
  },
})
