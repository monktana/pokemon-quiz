import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    plugins: [
      react(),
      tailwindcss(),
      tsconfigPaths(),
      sentryVitePlugin({
        org: process.env.VITE_SENTRY_ORG,
        project: process.env.VITE_SENTRY_PROJECT,

        // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
        authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
        reactComponentAnnotation: { enabled: true },
      }),
    ],
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
