/// <reference types="vitest" />

import { coverageConfigDefaults, defaultExclude, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// https://vitest.dev/config/
export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/vitest.setup.ts',
        exclude: [...defaultExclude, './tests/**'],
        coverage: {
          exclude: [...coverageConfigDefaults.exclude, './tests/**'],
          reporter: ['text', 'lcov'],
        },
      },
    })
  )
);
