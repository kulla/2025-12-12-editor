import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

const mode = process.env.NODE_ENV || 'development'

export default defineConfig({
  dev: { hmr: false },
  html: {
    title: 'Technical Prototype for the Serlo Editor',
  },
  output: {
    assetPrefix: '/serlo-editor-prototype/',
    sourceMap: {
      js: mode === 'development' ? 'eval-source-map' : 'source-map',
      css: true,
    },
  },
  plugins: [pluginReact()],
})
