import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/

export default defineConfig({
  root: './', // La raíz sigue siendo `client`
  build: {
    outDir: 'dist', // Genera los archivos en `dist`
  },
})
