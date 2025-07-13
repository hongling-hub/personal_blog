import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss";`
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [react()],
  server: {
    headers: {
      "Content-Security-Policy": "worker-src 'self' blob:"
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    port: 5173,
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index.html' },  // 显式重写根路径
        { from: /^\/[^.]+$/, to: '/index.html' } // 处理前端路由
      ]
    }
  }
})