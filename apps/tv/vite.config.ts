import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // 允许局域网设备访问
  },
  build: {
    target: 'es2020', // Android TV WebView 兼容
    outDir: 'dist',
  },
});
