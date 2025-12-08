import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Core React
              'vendor-react': ['react', 'react-dom'],
              // Three.js ecosystem (largest dependency)
              'vendor-three': ['three'],
              // R3F and related
              'vendor-r3f': ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
              // State management
              'vendor-zustand': ['zustand'],
              // Icons
              'vendor-icons': ['lucide-react'],
            }
          }
        }
      }
    };
});
