import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';
export default defineConfig([
  { ignores: ['**/.next/**', '**/dist/**', '**/generated/**', '**/next-env.d.ts', '**/node_modules/**', '.local/**'] },
  ...nextVitals.map(config => ({ ...config, files: ['apps/web/**/*.{ts,tsx}'] })),
  ...nextTs.map(config => ({ ...config, files: ['apps/web/**/*.{ts,tsx}'] })),
  ...tseslint.configs.recommended.map(config => ({ ...config, files: ['apps/api/**/*.ts'] }))
]);
