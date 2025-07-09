import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  external: [
    // Externalize all xala-technologies packages to avoid circular dependencies
    '@xala-technologies/norwegian-services',
    '@xala-technologies/security-compliance',
    '@xala-technologies/business-services',
    '@xala-technologies/data-services',
    '@xala-technologies/platform-services',
    '@xala-technologies/ui-system',
    '@xala-technologies/document-services',
    '@xala-technologies/test-infrastructure',
  ],
  clean: true,
  sourcemap: true,
});
