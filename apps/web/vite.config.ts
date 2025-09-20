import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const projectId = env.VITE_FIREBASE_PROJECT_ID || 'demo-project';
  const apiTarget =
    env.VITE_FUNCTIONS_ORIGIN ||
    `http://127.0.0.1:5001/${projectId}/us-central1`;

  const rewritePath = (path: string) => {
    if (path.startsWith('/api/gm-sse')) {
      return '/gmSse' + path.slice('/api/gm-sse'.length);
    }
    return path.replace(/^\/api\//, '/');
  };

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: rewritePath,
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: rewritePath,
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  };
});
