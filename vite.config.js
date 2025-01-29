import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // указывает на корневую директорию проекта
  build: {
    outDir: 'dist', // куда будет собираться проект
    sourcemap: true, // Включает исходные карты для сборки
  },
});
