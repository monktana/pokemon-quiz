import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            return id.includes('node_modules') ? 'vendor' : null;
          },
        },
      },
    },
  };
});
