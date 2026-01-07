import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Check xem đường dẫn file có chứa 'node_modules/three' không
          if (id.includes('node_modules/three/build/three.module.js')) {
            // Trả về tên file chunk riêng, ví dụ: 'three-vendor'
            return 'three-vendor'
          } else if (id.includes('node_modules/three/build/three.core.js')) {
            return 'react-three-vendor'
          }
        },
      },
    },
  },
})
