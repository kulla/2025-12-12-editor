import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

// @ts-expect-error This file is run in a Node.js environment
const mode = process.env.NODE_ENV || 'development'

export default defineConfig({
  dev: { hmr: false },
  html: {
    title: 'Editor Prototype',
  },
  output: {
    assetPrefix: '/2025-12-12-editor/',
    sourceMap: {
      js: mode === 'development' ? 'eval-source-map' : 'source-map',
      css: true,
    },
  },
  plugins: [pluginReact()],
})
