import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/algorithms/**/*.ts', 'src/components/Canvas/**/*.ts'],
      exclude: ['src/components/Canvas/Canvas.tsx', 'src/algorithms/codeSnippets.ts', 'src/components/Canvas/types.ts', 'src/components/Canvas/index.ts'],
      reporter: ['text', 'html'],
      thresholds: { lines: 60, functions: 60, branches: 50 }
    }
  }
});
