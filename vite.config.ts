import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // تعطيل HMR بشكل كامل لمنع الريفريش التلقائي
      hmr: false,
      // تعطيل file watching لمنع أي ريلود عند التعديل على الملفات
      watch: null,
    },
  };
});