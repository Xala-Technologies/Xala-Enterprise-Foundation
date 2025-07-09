# Xala Package Skeleton - Complete Configuration Guide

## Overview

This document provides a comprehensive skeleton for creating new packages in the Xala Enterprise ecosystem. It captures all configuration, CI/CD workflows, testing setup, and structural patterns from the `@xala-technologies/foundation` package that should be replicated across all 12 packages.

## Package Configuration

### Package.json Structure

```json
{
  "name": "@xala-technologies/{package-name}",
  "version": "2.0.0",
  "description": "Brief description with Norwegian compliance mention (min 50 chars)",
  "keywords": [
    "foundation",
    "norwegian-compliance",
    "modular-architecture",
    "event-driven",
    "nsm-security",
    "gdpr-compliance",
    "digdir-standards",
    "government-applications",
    "multi-platform",
    "react-native",
    "electron",
    "web",
    "mobile",
    "desktop",
    "api"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/Xala-Technologies/Xala-Enterprise-{PackageName}.git"
  },
  "license": "MIT",
  "author": "Xala Technologies",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./web": {
      "import": "./dist/platforms/web/index.esm.js",
      "require": "./dist/platforms/web/index.js",
      "types": "./dist/platforms/web/index.d.ts"
    },
    "./mobile": {
      "import": "./dist/platforms/mobile/index.esm.js",
      "require": "./dist/platforms/mobile/index.js",
      "types": "./dist/platforms/mobile/index.d.ts"
    },
    "./desktop": {
      "import": "./dist/platforms/desktop/index.esm.js",
      "require": "./dist/platforms/desktop/index.js",
      "types": "./dist/platforms/desktop/index.d.ts"
    },
    "./api": {
      "import": "./dist/platforms/api/index.esm.js",
      "require": "./dist/platforms/api/index.js",
      "types": "./dist/platforms/api/index.d.ts"
    }
  },
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md", "LICENSE", "CHANGELOG.md"],
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": ["*"]
    },
    "overrides": {
      "axios@>=1.3.2 <=1.7.3": ">=1.7.4",
      "axios@>=1.0.0 <1.8.2": ">=1.8.2"
    }
  }
}
```

### Scripts Configuration

Essential scripts that should be in every package:

```json
{
  "scripts": {
    "accessibility:keyboard": "echo '⌨️ Keyboard Navigation Check' && grep -r 'keyboard\\|keydown\\|keyup' src/ platforms/ || echo 'No keyboard navigation found'",
    "accessibility:wcag": "echo '♿ WCAG 2.2 AA Testing' && grep -r 'accessibility\\|wcag\\|aria-' src/ platforms/ || echo 'No accessibility implementations found'",
    "analyze:bundle": "rollup-plugin-analyzer dist/index.js",
    "analyze:size": "bundlesize",
    "audit:compliance": "npm run compliance:full && npm run compliance:report",
    "prebuild": "npm run clean && npm run lint && npm run typecheck",
    "build": "rollup -c && npm run build:docs",
    "build:analyze": "npm run build:prod && npm run analyze:bundle",
    "build:dev": "NODE_ENV=development rollup -c -w",
    "build:docs": "typedoc src/index.ts --out dist/docs --theme default",
    "build:prod": "NODE_ENV=production rollup -c",
    "clean": "rimraf dist",
    "compliance:full": "npm run nsm:security-scan && npm run gdpr:audit && npm run digdir:standards-check && npm run accessibility:wcag && npm run i18n:validate",
    "compliance:quick": "npm run nsm:classification-check && npm run gdpr:validate && npm run digdir:api-validation",
    "compliance:report": "echo '📊 Generating Norwegian Compliance Report' && node dist/tools/cli/index.js analyze --compliance --output=compliance-report.json",
    "dev": "npm run build:dev",
    "digdir:api-validation": "echo '📡 DigDir API Validation' && grep -r 'openapi\\|swagger\\|api' src/ platforms/ || echo 'No API documentation found'",
    "digdir:standards-check": "echo '🏛️ DigDir Standards Check' && node dist/tools/cli/index.js validate --digdir",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\"",
    "gdpr:audit": "echo '🛡️ GDPR Compliance Audit' && node dist/tools/cli/index.js compliance --gdpr --strict",
    "gdpr:validate": "echo '📋 GDPR Validation' && grep -r 'gdpr\\|GDPR\\|dataProtection\\|retention' src/ platforms/ || echo 'No GDPR implementations found'",
    "i18n:validate": "echo '🇳🇴 Norwegian Language Validation' && find . -name '*.json' -path '*/locales/*' -o -path '*/i18n/*' | grep -E '(nb|nn)' || echo 'No Norwegian locale files found'",
    "lint": "eslint src/**/*.ts platforms/**/*.ts tests/**/*.ts --max-warnings 200",
    "lint:fix": "eslint src/**/*.ts platforms/**/*.ts tests/**/*.ts --fix",
    "nsm:classification-check": "echo '🏛️ NSM Classification Check' && grep -r 'NSM_CLASSIFICATION\\|nsmClassification' src/ platforms/ || echo 'No NSM classifications found'",
    "nsm:security-scan": "echo '🔒 NSM Security Scan' && node dist/tools/cli/index.js audit --nsm --classification=BEGRENSET",
    "prepack": "npm run build:prod && npm run validate:build",
    "prepare": "husky install",
    "release": "semantic-release",
    "security:scan": "echo '🔒 Security Scan' && npm audit --audit-level=moderate",
    "test": "jest",
    "test:ci": "jest --passWithNoTests",
    "test:compliance": "jest --testPathPattern=tests/compliance",
    "test:coverage": "jest --coverage",
    "test:imports": "node scripts/test-imports.js",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:matrix": "npm run test:unit && npm run test:integration && npm run test:platforms && npm run test:compliance && npm run test:performance",
    "test:performance": "jest --testPathPattern=tests/performance",
    "test:platforms": "jest --testPathPattern=tests/platforms",
    "test:unit": "jest --testPathPattern=__tests__",
    "typecheck": "tsc --noEmit",
    "typecheck:all": "npm run typecheck && npm run typecheck:examples",
    "typecheck:examples": "cd examples && tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    "validate:build": "node scripts/validate-build.js",
    "version": "conventional-changelog -p angular -i CHANGELOG.md -s && git add CHANGELOG.md",
    "workflow:pre-commit": "lint-staged",
    "workflow:validate": "npm run lint:fix && npm run format:check && npm run typecheck && npm run compliance:quick"
  }
}
```

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "checkJs": false,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": false,
    "exactOptionalPropertyTypes": false,
    "noImplicitOverride": true,
    "useUnknownInCatchVariables": false,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/compliance/*": ["./src/compliance/*"],
      "@/norwegian/*": ["./src/norwegian/*"],
      "@/nsm/*": ["./src/nsm/*"],
      "@/gdpr/*": ["./src/gdpr/*"],
      "@/digdir/*": ["./src/digdir/*"]
    }
  },
  "include": ["src/**/*", "platforms/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    "tests/**/*",
    "examples/**/*",
    "tools/**/*"
  ]
}
```

### tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "inlineSourceMap": false,
    "inlineSources": false,
    "removeComments": false,
    "importHelpers": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "moduleDetection": "force",
    "verbatimModuleSyntax": false,
    "preserveValueImports": false,
    "types": ["node", "jest"],
    "baseUrl": ".",
    "paths": {
      "@foundation/*": ["src/*"],
      "@platforms/*": ["platforms/*"],
      "@tools/*": ["tools/*"],
      "@examples/*": ["examples/*"],
      "@tests/*": ["tests/*"]
    }
  },
  "include": ["src/**/*", "platforms/**/*", "tools/**/*", "tests/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/__tests__/**/*",
    "examples/**/node_modules",
    "examples/**/dist",
    "scripts/**/*",
    "*.config.js",
    "*.config.ts"
  ],
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
}
```

## Build Configuration

### rollup.config.js

```javascript
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

// Common plugins for all builds
const getBasePlugins = platform => [
  resolve({
    browser: platform === 'web',
    preferBuiltins: platform === 'api' || platform === 'desktop',
    exportConditions: platform === 'web' ? ['browser'] : ['node'],
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.build.json',
    declaration: false,
    declarationMap: false,
    sourceMap: isDevelopment,
    inlineSources: isDevelopment,
  }),
];

// Platform-specific external dependencies
const getExternals = platform => {
  const commonExternals = ['events', 'crypto', 'util', 'path', 'fs', 'os'];

  const platformExternals = {
    web: ['react', 'react-dom', 'react-router-dom'],
    mobile: [
      'react',
      'react-native',
      '@react-native-async-storage/async-storage',
      'react-native-keychain',
      'react-native-biometrics',
    ],
    desktop: ['electron', 'electron-store', 'electron-updater'],
    api: ['express', 'cors', 'helmet', 'compression', 'jsonwebtoken'],
  };

  return platform === 'core' ? [] : [...commonExternals, ...(platformExternals[platform] || [])];
};

// Core package build configuration
const coreConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: isDevelopment,
      exports: 'named',
      banner: '/* @xala-technologies/{package-name} v2.0.0 - Core Package */',
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: isDevelopment,
      exports: 'named',
      banner: '/* @xala-technologies/{package-name} v2.0.0 - Core Package */',
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'PackageName',
      sourcemap: isDevelopment,
      exports: 'named',
      globals: {
        events: 'events',
        crypto: 'crypto',
      },
      banner: '/* @xala-technologies/{package-name} v2.0.0 - Core Package */',
    },
  ],
  external: getExternals('core'),
  plugins: getBasePlugins('core'),
};

// Platform-specific build configurations
const platformConfigs = ['web', 'mobile', 'desktop', 'api'].map(platform => ({
  input: `platforms/${platform}/index.ts`,
  output: [
    {
      file: `dist/platforms/${platform}/index.js`,
      format: 'cjs',
      sourcemap: isDevelopment,
      exports: 'named',
      banner: `/* @xala-technologies/{package-name} v2.0.0 - ${platform.charAt(0).toUpperCase() + platform.slice(1)} Platform */`,
    },
    {
      file: `dist/platforms/${platform}/index.esm.js`,
      format: 'es',
      sourcemap: isDevelopment,
      exports: 'named',
      banner: `/* @xala-technologies/{package-name} v2.0.0 - ${platform.charAt(0).toUpperCase() + platform.slice(1)} Platform */`,
    },
  ],
  external: getExternals(platform),
  plugins: getBasePlugins(platform),
}));

// CLI Tools build configuration
const toolsConfig = {
  input: 'tools/cli/index.ts',
  output: {
    file: 'dist/tools/cli/index.js',
    format: 'cjs',
    sourcemap: isDevelopment,
    exports: 'named',
    banner: '#!/usr/bin/env node\n/* @xala-technologies/{package-name}-cli v2.0.0 */',
  },
  external: ['fs', 'path', 'process', 'commander', 'chalk', 'inquirer', 'ora', 'boxen'],
  plugins: getBasePlugins('cli'),
};

// TypeScript declaration files configuration
const declarationConfigs = [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external: () => true,
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        emitDeclarationOnly: true,
        outDir: 'dist',
      }),
    ],
  },
];

export default [coreConfig, ...platformConfigs, toolsConfig, ...declarationConfigs];
```

### tsup.config.ts (Alternative Build Tool)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  external: [
    // Externalize all xala-technologies packages to avoid circular dependencies
    '@xala-technologies/foundation',
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
```

## Testing Configuration

### jest.config.cjs

```javascript
const path = require('path');

// Determine if we're running in GitHub Actions
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

// Get the correct root directory for GitHub Actions
const getRootDir = () => {
  if (isGitHubActions) {
    const workspaceDir = process.env.GITHUB_WORKSPACE;
    if (workspaceDir) {
      return workspaceDir;
    }
    const currentDir = process.cwd();
    if (currentDir.includes('/Xala-Enterprise-{PackageName}')) {
      const correctDir = currentDir.replace(
        '/Xala-Enterprise-{PackageName}',
        '/Xala-Enterprise-{PackageName}'
      );
      console.log(
        `GitHub Actions: Correcting nested directory from ${currentDir} to ${correctDir}`
      );
      return correctDir;
    }
  }
  return process.cwd();
};

const rootDir = getRootDir();

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: rootDir,
  roots: [path.join(rootDir, 'src'), path.join(rootDir, 'tests')],
  testMatch: [
    path.join(rootDir, 'src/**/__tests__/**/*.test.ts'),
    path.join(rootDir, 'src/**/*.test.ts'),
    path.join(rootDir, 'tests/**/*.test.ts'),
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: [path.join(rootDir, 'tests/setup.ts')],
  globalSetup: path.join(rootDir, 'tests/global-setup.ts'),
  globalTeardown: path.join(rootDir, 'tests/global-teardown.ts'),
  testTimeout: 30000,
  verbose: true,
  // Add CI-specific settings
  ...(isGitHubActions && {
    maxWorkers: 2,
    forceExit: true,
    detectOpenHandles: false,
  }),
  // Handle ES modules properly
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': path.join(rootDir, 'src/$1'),
  },
};
```

### tests/jest.config.cjs (Multi-project)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '..',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts', '**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'platforms/**/*.ts',
    'tools/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.stories.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
      collectCoverageFrom: ['src/**/*.ts'],
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      testTimeout: 60000,
    },
    {
      displayName: 'Platform Tests',
      testMatch: ['<rootDir>/tests/platforms/**/*.test.ts'],
      testTimeout: 30000,
    },
    {
      displayName: 'Compliance Tests',
      testMatch: ['<rootDir>/tests/compliance/**/*.test.ts'],
      testTimeout: 45000,
    },
    {
      displayName: 'Performance Tests',
      testMatch: ['<rootDir>/tests/performance/**/*.test.ts'],
      testTimeout: 120000,
    },
  ],
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
};
```

## Code Quality Configuration

### .eslintrc.cjs

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'off',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-as-const': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error', 'info'],
      },
    ],
    'norwegian-compliance/nsm-classification': 'off',
    'norwegian-compliance/gdpr-compliant': 'off',
    'norwegian-compliance/digdir-standards': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: [
        '**/compliance/**/*.ts',
        '**/norwegian/**/*.ts',
        '**/*compliance*.ts',
        '**/*nsm*.ts',
        '**/*gdpr*.ts',
        '**/*digdir*.ts',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-console': 'error',
      },
    },
    {
      files: ['platforms/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
  ],
  env: {
    node: true,
    es2020: true,
    jest: true,
  },
  globals: {
    NSM_CLASSIFICATION: 'readonly',
    GDPR_ENABLED: 'readonly',
    DIGDIR_COMPLIANT: 'readonly',
  },
};
```

### .prettierrc.js

```javascript
module.exports = {
  // Norwegian government standards
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  semi: true,
  printWidth: 80,
  endOfLine: 'lf',
  arrowParens: 'avoid',
  bracketSpacing: true,
  bracketSameLine: false,
  quoteProps: 'as-needed',

  // File-specific overrides
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
  ],
};
```

### commitlint.config.cjs

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting
        'refactor', // Code refactoring
        'perf', // Performance improvement
        'test', // Testing
        'chore', // Maintenance
        'compliance', // Norwegian compliance changes
        'security', // Security updates
        'accessibility', // Accessibility improvements
      ],
    ],

    'scope-enum': [
      1,
      'always',
      [
        'auth',
        'ui',
        'api',
        'db',
        'config',
        'deps',
        'security',
        'accessibility',
        'norwegian',
        'nsm',
        'gdpr',
        'wcag',
      ],
    ],

    'subject-max-length': [2, 'always', 72],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100],
  },
};
```

### .lintstagedrc.cjs

```javascript
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
```

## File Structure

### Required Directory Structure

```
{package-name}/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── release.yml
│       ├── publish.yml
│       ├── norwegian-compliance.yml
│       └── security.yml
├── .husky/
│   ├── pre-commit
│   ├── commit-msg
│   └── pre-push
├── checklists/
│   ├── hub-spoke-architecture/
│   │   ├── phase-1.md
│   │   ├── phase-2.md
│   │   └── phase-3.md
│   ├── packages/
│   │   └── {package-name}/
│   │       └── package-checklist.md
│   └── README.md
├── config/
├── docs/
│   ├── api-reference/
│   │   ├── compliance/
│   │   │   └── nsm.md
│   │   ├── core/
│   │   ├── platforms/
│   │   │   └── web.md
│   │   └── README.md
│   ├── architecture/
│   │   └── {package-name}-overview.md
│   ├── compliance/
│   │   └── norwegian-compliance.md
│   ├── examples/
│   ├── guides/
│   │   ├── migration-guide.md
│   │   └── platform-implementation.md
│   ├── implementation/
│   │   └── development-workflow.md
│   ├── modules/
│   │   └── README.md
│   ├── testing/
│   │   └── user-story-tests.md
│   ├── getting-started.md
│   ├── implementation-guide.md
│   ├── migration-guide.md
│   ├── norwegian-tslm-strategy.md
│   ├── README.md
│   ├── testing.md
│   ├── troubleshooting.md
│   └── use-cases.md
├── examples/
│   ├── basic-usage/
│   ├── snippets/
│   ├── tutorials/
│   │   └── getting-started/
│   │       └── README.md
│   ├── README.md
│   └── tsconfig.json
├── platforms/
│   ├── api/
│   │   ├── index.ts
│   │   ├── setup.ts
│   │   └── [specific-implementations]
│   ├── desktop/
│   │   ├── index.ts
│   │   ├── setup.ts
│   │   └── [specific-implementations]
│   ├── mobile/
│   │   ├── index.ts
│   │   ├── setup.ts
│   │   └── [specific-implementations]
│   └── web/
│       ├── index.ts
│       ├── setup.ts
│       └── [specific-implementations]
├── scripts/
│   ├── audit.sh
│   ├── build.sh
│   ├── bundle-analyzer.js
│   ├── health-check.js
│   ├── publish.sh
│   ├── release.sh
│   ├── test-imports.js
│   ├── test-norwegian-compliance.mjs
│   ├── test.sh
│   ├── validate-build.js
│   ├── validate-commit-message.cjs
│   ├── validate-local.sh
│   └── validate-translations.js
├── src/
│   ├── __tests__/
│   │   └── index.stories.test.ts
│   ├── [module-1]/
│   │   ├── __tests__/
│   │   │   └── [module-1].stories.test.ts
│   │   ├── index.ts
│   │   └── README.md
│   ├── [module-2]/
│   │   ├── __tests__/
│   │   │   └── [module-2].stories.test.ts
│   │   ├── index.ts
│   │   └── README.md
│   └── index.ts
├── templates/
│   └── norwegian-components/
├── tests/
│   ├── compliance/
│   │   └── norwegian-government.test.ts
│   ├── integration/
│   │   └── module-integration.test.ts
│   ├── performance/
│   │   └── benchmarks.test.ts
│   ├── platforms/
│   │   └── web-platform.test.ts
│   ├── global-setup.ts
│   ├── global-teardown.ts
│   ├── jest.config.cjs
│   └── setup.ts
├── tools/
│   ├── cli/
│   │   ├── commands/
│   │   │   ├── analyze.ts
│   │   │   ├── audit.ts
│   │   │   ├── migrate.ts
│   │   │   └── setup.ts
│   │   ├── index.ts
│   │   └── package-info.ts
│   ├── compliance/
│   │   └── index.ts
│   ├── compliance-checker/
│   ├── config-validator/
│   └── validators/
│       └── config-validator.ts
├── .eslintrc.cjs
├── .gitignore
├── .lintstagedrc.cjs
├── .npmignore
├── .npmrc.example
├── .prettierignore
├── .prettierrc
├── .prettierrc.js
├── CHANGELOG.md
├── commitlint.config.cjs
├── jest.config.cjs
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── README.md
├── rollup.config.js
├── SECURITY.md
├── test-esm-imports.mjs
├── test-imports.js
├── tsconfig.build.json
├── tsconfig.json
├── tsup.config.ts
└── validate_docs.mjs
```

## Git Configuration

### .gitignore

```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage
.grunt

# Bower dependency directory
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.*
!.env.example

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/

# vuepress build output
.vuepress/dist

# vuepress v2.x temp and cache directory
.temp
.cache

# Sveltekit cache directory
.svelte-kit/

# vitepress build output
**/.vitepress/dist

# vitepress cache directory
**/.vitepress/cache

# Docusaurus cache and generated files
.docusaurus

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# Firebase cache directory
.firebase/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v3
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# Vite logs files
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
.env
.npmrc
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### .npmignore

```npmignore
# Development files
*.log
*.tmp
.DS_Store
.env*
.vscode/
.idea/
.husky/

# Test files
coverage/
*.test.ts
*.test.js
__tests__/
*.stories.*

# Build and development
node_modules/
.turbo/
.cache/
temp/

# Documentation that shouldn't be in package
docs/
checklists/
reports/

# CRITICAL: Exclude full applications from npm package
examples/municipal/
examples/platforms/
examples/international/
examples/platform-testing/
examples/norwegian-municipal/

# Only include lightweight code snippets
!examples/basic-usage/
!examples/tutorials/
!examples/README.md
```

## Core Dependencies

```json
{
  "dependencies": {
    "@jest/globals": "^30.0.4",
    "commander": "^14.0.0",
    "date-fns": "^2.30.0",
    "eventemitter3": "^5.0.1",
    "lodash": "^4.17.21",
    "pino": "^9.7.0",
    "tslib": "^2.8.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.8.1",
    "@commitlint/config-conventional": "^19.8.1",
    "@rollup/plugin-commonjs": "^25.0.7",
    "@rollup/plugin-json": "^6.0.1",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-replace": "^5.0.5",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-typescript": "^11.1.5",
    "@types/jest": "^29.5.8",
    "@types/node": "^20.19.4",
    "@typescript-eslint/eslint-plugin": "^6.11.0",
    "@typescript-eslint/parser": "^6.11.0",
    "bundlesize": "^0.18.1",
    "conventional-changelog-cli": "^4.1.0",
    "eslint": "^8.53.0",
    "husky": "^8.0.3",
    "jest": "^29.7.0",
    "lint-staged": "^16.1.2",
    "prettier": "^3.0.3",
    "rimraf": "^5.0.5",
    "rollup": "^4.5.0",
    "rollup-plugin-analyzer": "^4.0.0",
    "rollup-plugin-copy": "^3.5.0",
    "rollup-plugin-dts": "^6.1.0",
    "rollup-plugin-filesize": "^10.0.0",
    "semantic-release": "^22.0.8",
    "sort-package-json": "^3.4.0",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.1",
    "typedoc": "^0.25.4",
    "typescript": "^5.2.2"
  },
  "peerDependencies": {
    "electron": ">=25.0.0",
    "react": ">=18.0.0",
    "react-native": ">=0.72.0"
  },
  "peerDependenciesMeta": {
    "electron": {
      "optional": true
    },
    "react": {
      "optional": true
    },
    "react-native": {
      "optional": true
    }
  }
}
```

## Bundle Size Configuration

```json
{
  "bundlesize": [
    {
      "path": "./dist/index.js",
      "maxSize": "50 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/platforms/web/index.js",
      "maxSize": "25 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/platforms/mobile/index.js",
      "maxSize": "30 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/platforms/desktop/index.js",
      "maxSize": "35 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/platforms/api/index.js",
      "maxSize": "40 kB",
      "compression": "gzip"
    }
  ]
}
```

## CI/CD Configuration

### .github/workflows/ci.yml

```yaml
name: Continuous Integration

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_ENV: test
  FORCE_COLOR: 1

jobs:
  test:
    name: Test on Node.js ${{ matrix.node-version }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 21.x]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - uses: actions/cache@v3
        name: Setup pnpm cache
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run type checking
        run: pnpm run typecheck

      - name: Run linting
        run: pnpm run lint

      - name: Run tests
        run: pnpm run test:ci

      - name: Run tests with coverage
        run: pnpm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false

  build:
    name: Build and validate
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build package
        run: pnpm run build

      - name: Validate package integrity
        run: |
          test -f dist/index.js
          test -f dist/index.d.ts

          cat > validate_package.mjs << 'EOF'
          import fs from 'fs';
          const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
          console.log('Package:', pkg.name, pkg.version);
          if (!pkg.main || !pkg.types) throw new Error('Missing main or types field');
          console.log('✅ Package validation passed');
          EOF

          node validate_package.mjs
          rm validate_package.mjs

      - name: Check bundle size
        run: |
          ls -la dist/
          BUNDLE_SIZE=$(find dist/ -name "*.js" -not -name "*.d.ts" -exec wc -c {} + | tail -1 | awk '{print $1}')
          echo "Bundle size: $BUNDLE_SIZE bytes"
          if [ $BUNDLE_SIZE -gt 5242880 ]; then
            echo "Bundle size exceeds 5MB limit"
            exit 1
          fi

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist-${{ github.sha }}
          path: dist/
          retention-days: 7

  validate-norwegian-compliance:
    name: Validate Norwegian compliance features
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist-${{ github.sha }}
          path: dist/

      - name: Test Norwegian Compliance Features
        run: node scripts/test-norwegian-compliance.mjs

  documentation-check:
    name: Documentation validation
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Check required documentation files
        run: |
          test -f README.md || (echo "Missing README.md" && exit 1)
          test -f docs/README.md || (echo "Missing docs/README.md" && exit 1)
          test -f docs/getting-started.md || (echo "Missing getting started guide" && exit 1)
          test -f docs/implementation-guide.md || (echo "Missing implementation guide" && exit 1)
          test -f docs/troubleshooting.md || (echo "Missing troubleshooting guide" && exit 1)
          test -f docs/compliance/norwegian-compliance.md || (echo "Missing Norwegian compliance docs" && exit 1)
          test -f docs/contributing.md || (echo "Missing contributing guide" && exit 1)
          echo "✅ All required documentation files present"

  summary:
    name: CI Summary
    runs-on: ubuntu-latest
    needs: [test, build, validate-norwegian-compliance, documentation-check]
    if: always()

    steps:
      - name: Check all jobs status
        run: |
          echo "CI Results Summary:"
          echo "- Tests: ${{ needs.test.result }}"
          echo "- Build: ${{ needs.build.result }}"
          echo "- Norwegian Compliance: ${{ needs.validate-norwegian-compliance.result }}"
          echo "- Documentation: ${{ needs.documentation-check.result }}"

          if [[ "${{ needs.test.result }}" != "success" ||
                "${{ needs.build.result }}" != "success" ||
                "${{ needs.validate-norwegian-compliance.result }}" != "success" ||
                "${{ needs.documentation-check.result }}" != "success" ]]; then
            echo "❌ One or more CI checks failed"
            exit 1
          fi

          echo "✅ All CI checks passed successfully"
```

### .github/workflows/norwegian-compliance.yml

```yaml
name: Norwegian Compliance Check

on:
  schedule:
    - cron: '0 2 * * 1' # Every Monday at 2 AM
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'platforms/**'
      - 'tests/compliance/**'

jobs:
  nsm-security-check:
    name: NSM Security Classification Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run NSM Classification Check
        run: pnpm run nsm:classification-check

      - name: Run NSM Security Scan
        run: pnpm run nsm:security-scan

  gdpr-compliance-check:
    name: GDPR Compliance Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run GDPR Validation
        run: pnpm run gdpr:validate

      - name: Run GDPR Audit
        run: pnpm run gdpr:audit

  digdir-standards-check:
    name: DigDir Standards Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run DigDir Standards Check
        run: pnpm run digdir:standards-check

      - name: Run DigDir API Validation
        run: pnpm run digdir:api-validation

  accessibility-check:
    name: Accessibility Compliance Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run WCAG Compliance Check
        run: pnpm run accessibility:wcag

      - name: Run Keyboard Navigation Check
        run: pnpm run accessibility:keyboard

  language-validation:
    name: Norwegian Language Validation
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Validate Norwegian Language Files
        run: pnpm run i18n:validate

  compliance-summary:
    name: Compliance Summary
    runs-on: ubuntu-latest
    needs:
      [
        nsm-security-check,
        gdpr-compliance-check,
        digdir-standards-check,
        accessibility-check,
        language-validation,
      ]
    if: always()

    steps:
      - name: Generate compliance report
        run: |
          echo "🇳🇴 Norwegian Compliance Summary:"
          echo "- NSM Security: ${{ needs.nsm-security-check.result }}"
          echo "- GDPR Compliance: ${{ needs.gdpr-compliance-check.result }}"
          echo "- DigDir Standards: ${{ needs.digdir-standards-check.result }}"
          echo "- Accessibility: ${{ needs.accessibility-check.result }}"
          echo "- Language Validation: ${{ needs.language-validation.result }}"

          if [[ "${{ needs.nsm-security-check.result }}" != "success" ||
                "${{ needs.gdpr-compliance-check.result }}" != "success" ||
                "${{ needs.digdir-standards-check.result }}" != "success" ||
                "${{ needs.accessibility-check.result }}" != "success" ||
                "${{ needs.language-validation.result }}" != "success" ]]; then
            echo "❌ One or more compliance checks failed"
            exit 1
          fi

          echo "✅ All Norwegian compliance checks passed"
```

## Platform-Specific Configuration

### Platform Structure Template

Each package should have platform-specific implementations:

#### platforms/web/index.ts

```typescript
/**
 * Web Platform Entry Point
 * Browser-optimized version of {Package Name}
 */

// Re-export core functionality
export * from '../../src/index.js';

// Web-specific exports
export * from './metrics-collector.js';
export { setupWeb } from './setup.js';
export { WebStorageAdapter as BrowserStorageAdapter } from './storage-adapter.js';
export * from './web-events.js';
export * from './web-logger.js';
export * from './web-storage.js';

// Platform detection
export const PLATFORM = 'web' as const;

// Web-specific configuration interface
export interface WebPackageConfig {
  municipality?: string;
  language?: 'nb' | 'nn' | 'en';
  localStorage?: boolean;
  sessionStorage?: boolean;
  analytics?: boolean;
  debug?: boolean;
  compliance?: {
    nsmClassification?: string;
    gdprEnabled?: boolean;
    auditRequired?: boolean;
    retentionPeriod?: string;
  };
}
```

#### platforms/mobile/index.ts

```typescript
/**
 * Mobile Platform Entry Point
 * React Native optimized version of {Package Name}
 */

// Re-export core functionality
export * from '../../src/index.js';

// Mobile-specific exports
export * from './mobile-events.js';
export * from './mobile-logger.js';
export * from './mobile-storage.js';
export * from './offline-support.js';
export { setupMobile } from './setup.js';

// Platform detection
export const PLATFORM = 'mobile' as const;

// Mobile-specific configuration interface
export interface MobilePackageConfig {
  municipality?: string;
  language?: 'nb' | 'nn' | 'en';
  offlineSupport?: boolean;
  biometricAuth?: boolean;
  pushNotifications?: boolean;
  compliance?: {
    nsmClassification?: string;
    gdprEnabled?: boolean;
    localDataEncryption?: boolean;
  };
}
```

#### platforms/desktop/index.ts

```typescript
/**
 * Desktop Platform Entry Point
 * Electron optimized version of {Package Name}
 */

// Re-export core functionality
export * from '../../src/index.js';

// Desktop-specific exports
export * from './desktop-events.js';
export * from './desktop-logger.js';
export * from './desktop-storage.js';
export * from './ipc-bridge.js';
export { setupDesktop } from './setup.js';

// Platform detection
export const PLATFORM = 'desktop' as const;

// Desktop-specific configuration interface
export interface DesktopPackageConfig {
  municipality?: string;
  language?: 'nb' | 'nn' | 'en';
  autoUpdater?: boolean;
  systemIntegration?: boolean;
  compliance?: {
    nsmClassification?: string;
    gdprEnabled?: boolean;
    secureStorage?: boolean;
    encryptedBackups?: boolean;
  };
}
```

#### platforms/api/index.ts

```typescript
/**
 * API Platform Entry Point
 * Server/Node.js optimized version of {Package Name}
 */

// Re-export core functionality
export * from '../../src/index.js';

// API-specific exports
export * from './api-events.js';
export * from './api-logger.js';
export * from './api-metrics.js';
export * from './health-checks.js';
export { setupApi } from './setup.js';

// Platform detection
export const PLATFORM = 'api' as const;

// API-specific configuration interface
export interface ApiPackageConfig {
  municipality?: string;
  language?: 'nb' | 'nn' | 'en';
  cors?: boolean;
  rateLimiting?: boolean;
  authentication?: boolean;
  compliance?: {
    nsmClassification?: string;
    gdprEnabled?: boolean;
    auditLogging?: boolean;
    encryptionInTransit?: boolean;
    encryptionAtRest?: boolean;
  };
}
```

## Norwegian Compliance Features

### Required Compliance Modules

Each package must include these compliance-related modules:

1. **NSM Security Classification**
   - Support for ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG classifications
   - Automatic encryption requirements based on classification
   - Access control enforcement
   - Audit trail generation

2. **GDPR Compliance**
   - Data minimization principles
   - Consent management
   - Right to erasure implementation
   - Data portability support
   - Retention policy enforcement

3. **DigDir Standards**
   - API documentation with OpenAPI
   - Interoperability requirements
   - Accessibility standards (WCAG 2.2 AA)
   - Multi-language support (Bokmål, Nynorsk, English)

4. **Norwegian Government Integration**
   - Altinn integration support
   - ID-porten authentication
   - Kartverket services
   - Municipal system compatibility

### Testing Requirements

### tests/compliance/norwegian-government.test.ts

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Norwegian Government Compliance', () => {
  describe('NSM Security Classifications', () => {
    it('should support all NSM classification levels', () => {
      const classifications = ['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'];
      // Test implementation
    });

    it('should enforce encryption for non-ÅPEN classifications', () => {
      // Test encryption requirements
    });

    it('should implement proper access controls', () => {
      // Test access control implementation
    });
  });

  describe('GDPR Compliance', () => {
    it('should support data minimization', () => {
      // Test data minimization
    });

    it('should handle consent management', () => {
      // Test consent management
    });

    it('should implement right to erasure', () => {
      // Test data deletion
    });
  });

  describe('DigDir Standards', () => {
    it('should meet accessibility requirements', () => {
      // Test WCAG 2.2 AA compliance
    });

    it('should support Norwegian languages', () => {
      // Test Norwegian language support
    });
  });
});
```

## Scripts and Automation

### scripts/test-norwegian-compliance.mjs

```javascript
#!/usr/bin/env node

console.log('🇳🇴 Testing Norwegian Compliance Features...');

try {
  // Import the built package
  const packageModule = await import('../dist/index.esm.js');

  // Test NSM classifications
  console.log('🔒 Testing NSM Classifications...');
  const nsmClassifications = ['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'];

  if (packageModule.NSM_CLASSIFICATIONS) {
    const supportedClassifications = packageModule.NSM_CLASSIFICATIONS;
    const missingClassifications = nsmClassifications.filter(
      classification => !supportedClassifications.includes(classification)
    );

    if (missingClassifications.length > 0) {
      throw new Error(`Missing NSM classifications: ${missingClassifications.join(', ')}`);
    }
    console.log('✅ All NSM classifications supported');
  } else {
    console.log('⚠️ NSM classifications not found in package');
  }

  // Test GDPR compliance features
  console.log('🛡️ Testing GDPR Compliance...');
  if (packageModule.GDPR_LEGAL_BASIS) {
    const requiredBasis = [
      'consent',
      'contract',
      'legal_obligation',
      'vital_interests',
      'public_task',
      'legitimate_interests',
    ];
    const supportedBasis = packageModule.GDPR_LEGAL_BASIS;

    const missingBasis = requiredBasis.filter(basis => !supportedBasis.includes(basis));

    if (missingBasis.length > 0) {
      throw new Error(`Missing GDPR legal basis: ${missingBasis.join(', ')}`);
    }
    console.log('✅ All GDPR legal basis supported');
  } else {
    console.log('⚠️ GDPR legal basis not found in package');
  }

  // Test DigDir standards
  console.log('🏛️ Testing DigDir Standards...');
  if (packageModule.DIGDIR_STANDARDS) {
    const standards = packageModule.DIGDIR_STANDARDS;

    if (standards.ACCESSIBILITY_LEVEL !== 'AA') {
      throw new Error('DigDir accessibility level must be AA');
    }

    if (!standards.INTEROPERABILITY_REQUIRED) {
      throw new Error('DigDir interoperability must be required');
    }

    console.log('✅ DigDir standards compliance verified');
  } else {
    console.log('⚠️ DigDir standards not found in package');
  }

  // Test Norwegian municipalities support
  console.log('🏛️ Testing Norwegian Municipalities...');
  if (packageModule.NORWEGIAN_MUNICIPALITIES) {
    const municipalities = packageModule.NORWEGIAN_MUNICIPALITIES;
    const requiredMunicipalities = ['OSLO', 'BERGEN', 'TRONDHEIM', 'STAVANGER'];

    const missingMunicipalities = requiredMunicipalities.filter(
      municipality => !municipalities.has(municipality)
    );

    if (missingMunicipalities.length > 0) {
      throw new Error(`Missing municipalities: ${missingMunicipalities.join(', ')}`);
    }
    console.log('✅ Norwegian municipalities support verified');
  } else {
    console.log('⚠️ Norwegian municipalities not found in package');
  }

  console.log('🎉 Norwegian compliance validation completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Norwegian compliance validation failed:', error.message);
  process.exit(1);
}
```

### scripts/validate-build.js

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating build output...');

const distDir = path.join(process.cwd(), 'dist');

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory not found');
  process.exit(1);
}

// Required files
const requiredFiles = [
  'index.js',
  'index.esm.js',
  'index.d.ts',
  'platforms/web/index.js',
  'platforms/web/index.esm.js',
  'platforms/web/index.d.ts',
  'platforms/mobile/index.js',
  'platforms/mobile/index.esm.js',
  'platforms/mobile/index.d.ts',
  'platforms/desktop/index.js',
  'platforms/desktop/index.esm.js',
  'platforms/desktop/index.d.ts',
  'platforms/api/index.js',
  'platforms/api/index.esm.js',
  'platforms/api/index.d.ts',
];

// Check each required file
for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file missing: ${file}`);
    process.exit(1);
  }

  // Check file size (should not be empty)
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    console.error(`❌ File is empty: ${file}`);
    process.exit(1);
  }
}

console.log('✅ Build validation passed');

// Check package.json consistency
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Validate exports field
if (!packageJson.exports) {
  console.error('❌ package.json missing exports field');
  process.exit(1);
}

// Validate main files exist
if (packageJson.main && !fs.existsSync(path.join(distDir, path.basename(packageJson.main)))) {
  console.error(`❌ Main file not found: ${packageJson.main}`);
  process.exit(1);
}

if (packageJson.types && !fs.existsSync(path.join(distDir, path.basename(packageJson.types)))) {
  console.error(`❌ Types file not found: ${packageJson.types}`);
  process.exit(1);
}

console.log('✅ Package.json validation passed');
console.log('🎉 All build validations passed!');
```

## Package-Specific Customizations

### Foundation Package Specifics

For the foundation package, ensure these modules are included:

- config-loader
- error-handler
- event-core
- event-publisher
- event-subscriber
- feature-toggle
- healthcheck
- i18n-core
- logger
- metrics-sdk
- saga-orchestrator

### Authentication Package Specifics

For the authentication package, include:

- id-porten integration
- bankid integration
- feide integration
- jwt token management
- rbac implementation
- session management
- biometric authentication

### Business Services Package Specifics

For the business-services package, include:

- crud operations
- business rule engine
- workflow orchestration
- event sourcing
- approval workflows
- document lifecycle
- notification orchestration

### Data Services Package Specifics

For the data-services package, include:

- database abstraction
- migration framework
- backup automation
- data synchronization
- read/write splitting
- performance optimization
- data archival

## Summary

This skeleton provides a comprehensive template for creating consistent, Norwegian-compliant packages across the entire Xala ecosystem. Each package should:

1. **Follow the exact same configuration patterns** for TypeScript, build tools, testing, and CI/CD
2. **Implement the same Norwegian compliance features** with package-specific adaptations
3. **Maintain the same quality standards** with comprehensive testing and validation
4. **Use the same development workflow** with consistent scripts and automation
5. **Support all four platforms** (web, mobile, desktop, API) with appropriate optimizations

When creating a new package:

1. Copy this skeleton structure
2. Replace `{package-name}` and `{PackageName}` with the actual package name
3. Implement package-specific functionality while maintaining the core patterns
4. Ensure all Norwegian compliance features are properly implemented
5. Test thoroughly using the provided CI/CD workflows
6. Document according to the established patterns

This approach ensures consistency, quality, and compliance across the entire Xala Enterprise ecosystem while allowing for package-specific functionality and optimizations.
