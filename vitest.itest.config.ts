import { defineConfig } from 'vitest/config'
import path from 'path'

// Integration tests — hit the real dev DB (:5434). Run explicitly:
//   DATABASE_URL=... npx vitest run --config vitest.itest.config.ts
// Kept out of the default unit run (vitest.config.ts includes only *.test.ts).
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.itest.ts'],
    fileParallelism: false,
    testTimeout: 30000,
  },
})
