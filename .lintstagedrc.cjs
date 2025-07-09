// ==========================================
// .lintstagedrc.js - Lint-staged Configuration
// ==========================================

module.exports = {
  // TypeScript and JavaScript files in main library (src, platforms, tools)
  '{src,platforms,tools}/**/*.{ts,tsx,js,jsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
    'pnpm exec tsc --noEmit',
  ],

  // TypeScript and JavaScript files in examples (separate handling)
  'examples/**/*.{ts,tsx,js,jsx}': ['eslint --fix --max-warnings 0', 'prettier --write'],

  // JSON and Markdown files
  '*.{json,md,yml,yaml}': ['prettier --write'],

  // Package.json specific
  'package.json': ['prettier --write', 'sort-package-json'],

  // Norwegian-specific files
  '**/locales/**/*.json': ['prettier --write'],
};
