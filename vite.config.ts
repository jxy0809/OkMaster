import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键配置：设置为相对路径 './'，确保资源在 GitHub Pages 子路径下能被正确找到
  base: './',
  build: {
    outDir: 'dist',
  },
});
