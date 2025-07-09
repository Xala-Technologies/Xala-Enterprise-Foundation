# Foundation Package - Project Structure & Setup

## Repository Structure

```
@xala/foundation/
├── README.md
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── .nvmrc
├── LICENSE
├── CHANGELOG.md
├── CONTRIBUTING.md
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   ├── security.yml
│   │   ├── compliance.yml
│   │   └── codeql.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   ├── norwegian_compliance.md
│   │   └── security_issue.md
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── config.interface.ts
│   │   ├── logger.interface.ts
│   │   ├── event.interface.ts
│   │   ├── norwegian.interface.ts
│   │   ├── platform.interface.ts
│   │   └── multi-platform.interface.ts
│   ├── config-loader/
│   │   ├── index.ts
│   │   ├── config-loader.ts
│   │   ├── config-validator.ts
│   │   ├── environment.ts
│   │   ├── norwegian-config.ts
│   │   ├── platform-config.ts
│   │   └── municipal-config.ts
│   ├── logger/
│   │   ├── index.ts
│   │   ├── logger.ts
│   │   ├── formatters/
│   │   │   ├── json-formatter.ts
│   │   │   ├── text-formatter.ts
│   │   │   ├── nsm-formatter.ts
│   │   │   └── mobile-formatter.ts
│   │   ├── transports/
│   │   │   ├── console-transport.ts
│   │   │   ├── file-transport.ts
│   │   │   ├── audit-transport.ts
│   │   │   └── websocket-transport.ts
│   │   ├── norwegian-logger.ts
│   │   └── platform-logger.ts
│   ├── error-handler/
│   │   ├── index.ts
│   │   ├── error-handler.ts
│   │   ├── error-types.ts
│   │   ├── error-classifier.ts
│   │   ├── norwegian-error-handler.ts
│   │   ├── platform-error-handler.ts
│   │   └── municipal-error-codes.ts
│   ├── event-core/
│   │   ├── index.ts
│   │   ├── event-emitter.ts
│   │   ├── event-types.ts
│   │   ├── event-validator.ts
│   │   ├── norwegian-events.ts
│   │   ├── municipal-events.ts
│   │   └── real-time-events.ts
│   ├── event-publisher/
│   │   ├── index.ts
│   │   ├── publisher.ts
│   │   ├── retry-strategy.ts
│   │   ├── batch-publisher.ts
│   │   ├── norwegian-publisher.ts
│   │   ├── websocket-publisher.ts
│   │   └── mobile-publisher.ts
│   ├── event-subscriber/
│   │   ├── index.ts
│   │   ├── subscriber.ts
│   │   ├── subscription-manager.ts
│   │   ├── error-handler.ts
│   │   ├── norwegian-subscriber.ts
│   │   ├── websocket-subscriber.ts
│   │   └── platform-subscriber.ts
│   ├── feature-toggle/
│   │   ├── index.ts
│   │   ├── toggle-service.ts
│   │   ├── toggle-strategy.ts
│   │   ├── toggle-storage.ts
│   │   ├── norwegian-toggles.ts
│   │   ├── municipal-toggles.ts
│   │   └── platform-toggles.ts
│   ├── i18n-core/
│   │   ├── index.ts
│   │   ├── i18n-service.ts
│   │   ├── message-loader.ts
│   │   ├── interpolation.ts
│   │   ├── locales/
│   │   │   ├── nb.json
│   │   │   ├── nn.json
│   │   │   ├── en.json
│   │   │   ├── sami.json
│   │   │   └── index.ts
│   │   ├── norwegian-i18n.ts
│   │   ├── municipal-i18n.ts
│   │   └── platform-i18n.ts
│   ├── metrics-sdk/
│   │   ├── index.ts
│   │   ├── metrics-collector.ts
│   │   ├── metrics-storage.ts
│   │   ├── metrics-exporter.ts
│   │   ├── norwegian-metrics.ts
│   │   ├── municipal-metrics.ts
│   │   ├── platform-metrics.ts
│   │   └── performance-metrics.ts
│   ├── healthcheck/
│   │   ├── index.ts
│   │   ├── health-service.ts
│   │   ├── health-check.ts
│   │   ├── dependency-checker.ts
│   │   ├── norwegian-health.ts
│   │   ├── municipal-health.ts
│   │   └── platform-health.ts
│   └── saga-orchestrator/
│       ├── index.ts
│       ├── saga-coordinator.ts
│       ├── saga-step.ts
│       ├── compensation-handler.ts
│       ├── norwegian-saga.ts
│       ├── municipal-saga.ts
│       └── distributed-saga.ts
├── platforms/
│   ├── web/
│   │   ├── index.ts
│   │   ├── web-logger.ts
│   │   ├── web-events.ts
│   │   └── web-storage.ts
│   ├── mobile/
│   │   ├── index.ts
│   │   ├── mobile-logger.ts
│   │   ├── mobile-events.ts
│   │   ├── mobile-storage.ts
│   │   └── offline-support.ts
│   ├── desktop/
│   │   ├── index.ts
│   │   ├── desktop-logger.ts
│   │   ├── desktop-events.ts
│   │   └── desktop-storage.ts
│   └── api/
│       ├── index.ts
│       ├── api-logger.ts
│       ├── api-events.ts
│       └── api-metrics.ts
├── __tests__/
│   ├── unit/
│   │   ├── config-loader.test.ts
│   │   ├── logger.test.ts
│   │   ├── error-handler.test.ts
│   │   ├── event-core.test.ts
│   │   ├── event-publisher.test.ts
│   │   ├── event-subscriber.test.ts
│   │   ├── feature-toggle.test.ts
│   │   ├── i18n-core.test.ts
│   │   ├── metrics-sdk.test.ts
│   │   ├── healthcheck.test.ts
│   │   └── saga-orchestrator.test.ts
│   ├── integration/
│   │   ├── config-loader.integration.test.ts
│   │   ├── logger.integration.test.ts
│   │   ├── error-handler.integration.test.ts
│   │   ├── event-system.integration.test.ts
│   │   ├── feature-toggle.integration.test.ts
│   │   ├── i18n-core.integration.test.ts
│   │   ├── metrics-sdk.integration.test.ts
│   │   ├── healthcheck.integration.test.ts
│   │   └── saga-orchestrator.integration.test.ts
│   ├── user-stories/
│   │   ├── config-loader.user-stories.test.ts
│   │   ├── logger.user-stories.test.ts
│   │   ├── error-handler.user-stories.test.ts
│   │   ├── event-core.user-stories.test.ts
│   │   ├── event-publisher.user-stories.test.ts
│   │   ├── event-subscriber.user-stories.test.ts
│   │   ├── feature-toggle.user-stories.test.ts
│   │   ├── i18n-core.user-stories.test.ts
│   │   ├── metrics-sdk.user-stories.test.ts
│   │   ├── healthcheck.user-stories.test.ts
│   │   └── saga-orchestrator.user-stories.test.ts
│   ├── compliance/
│   │   ├── nsm-compliance.test.ts
│   │   ├── gdpr-compliance.test.ts
│   │   ├── digdir-compliance.test.ts
│   │   └── accessibility.test.ts
│   ├── platform/
│   │   ├── web-platform.test.ts
│   │   ├── mobile-platform.test.ts
│   │   ├── desktop-platform.test.ts
│   │   └── api-platform.test.ts
│   ├── performance/
│   │   ├── config-loader.perf.test.ts
│   │   ├── logger.perf.test.ts
│   │   ├── event-system.perf.test.ts
│   │   └── metrics-sdk.perf.test.ts
│   └── helpers/
│       ├── test-utils.ts
│       ├── mock-config.ts
│       ├── mock-logger.ts
│       ├── norwegian-test-helpers.ts
│       └── platform-test-helpers.ts
├── docs/
│   ├── README.md
│   ├── getting-started/
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   ├── configuration.md
│   │   ├── norwegian-setup.md
│   │   └── platform-setup.md
│   ├── api/
│   │   ├── config-loader.md
│   │   ├── logger.md
│   │   ├── error-handler.md
│   │   ├── event-core.md
│   │   ├── event-publisher.md
│   │   ├── event-subscriber.md
│   │   ├── feature-toggle.md
│   │   ├── i18n-core.md
│   │   ├── metrics-sdk.md
│   │   ├── healthcheck.md
│   │   └── saga-orchestrator.md
│   ├── guides/
│   │   ├── norwegian-compliance.md
│   │   ├── international-setup.md
│   │   ├── platform-development.md
│   │   ├── testing-guide.md
│   │   ├── migration-guide.md
│   │   └── best-practices.md
│   ├── examples/
│   │   ├── municipal-booking-system.md
│   │   ├── multi-platform-app.md
│   │   ├── enterprise-setup.md
│   │   ├── event-driven-architecture.md
│   │   └── monitoring-setup.md
│   ├── platforms/
│   │   ├── web-frontend.md
│   │   ├── admin-dashboard.md
│   │   ├── mobile-app.md
│   │   ├── desktop-app.md
│   │   └── api-backend.md
│   └── troubleshooting/
│       ├── common-issues.md
│       ├── performance-optimization.md
│       ├── debugging.md
│       └── platform-specific-issues.md
├── examples/
│   ├── basic-usage/
│   │   ├── web-app/
│   │   ├── mobile-app/
│   │   ├── desktop-app/
│   │   └── api-service/
│   ├── norwegian-municipal/
│   │   ├── drammen-booking/
│   │   ├── oslo-services/
│   │   └── bergen-portal/
│   ├── international/
│   │   ├── multi-language/
│   │   ├── enterprise/
│   │   └── scalable-saas/
│   └── platform-specific/
│       ├── react-native-integration/
│       ├── electron-integration/
│       ├── nextjs-integration/
│       └── nestjs-integration/
├── tools/
│   ├── cli/
│   │   ├── index.ts
│   │   ├── generators/
│   │   └── validators/
│   ├── config-validator/
│   │   ├── index.ts
│   │   ├── schemas/
│   │   └── rules/
│   └── compliance-checker/
│       ├── index.ts
│       ├── nsm-checker.ts
│       ├── gdpr-checker.ts
│       └── accessibility-checker.ts
└── scripts/
    ├── build.sh
    ├── test.sh
    ├── lint.sh
    ├── compliance-check.sh
    └── release.sh
```

## Package Configuration

### package.json

```json
{
  "name": "@xala/foundation",
  "version": "1.0.0",
  "description": "Core infrastructure foundation for Norwegian-compliant multi-platform SaaS applications",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
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
  "scripts": {
    "build": "rollup -c && tsc -p tsconfig.build.json",
    "build:watch": "rollup -c -w",
    "dev": "tsc -w",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:user-stories": "jest --testPathPattern=user-stories",
    "test:compliance": "jest --testPathPattern=compliance",
    "test:platform": "jest --testPathPattern=platform",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write src/**/*.ts",
    "docs:generate": "typedoc src --out docs/api",
    "docs:serve": "docsify serve docs",
    "compliance:check": "npm run compliance:nsm && npm run compliance:gdpr",
    "compliance:nsm": "node tools/compliance-checker/nsm-checker.js",
    "compliance:gdpr": "node tools/compliance-checker/gdpr-checker.js",
    "validate:config": "node tools/config-validator/index.js",
    "prepare": "husky install && npm run build",
    "prepublishOnly": "npm run test && npm run lint && npm run build",
    "semantic-release": "semantic-release"
  },
  "keywords": [
    "foundation",
    "infrastructure",
    "norwegian",
    "compliance",
    "multi-platform",
    "saas",
    "municipal",
    "nsm",
    "gdpr",
    "react-native",
    "electron",
    "nextjs",
    "nestjs"
  ],
  "author": "Xala Technologies <hello@xala.no>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/xalatechnologies/xala-foundation.git"
  },
  "bugs": {
    "url": "https://github.com/xalatechnologies/xala-foundation/issues"
  },
  "homepage": "https://xala.no/packages/foundation",
  "dependencies": {
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "eventemitter3": "^5.0.1",
    "uuid": "^9.0.1",
    "lodash": "^4.17.21",
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/jest": "^29.5.8",
    "@types/uuid": "^9.0.7",
    "@types/lodash": "^4.14.202",
    "@typescript-eslint/eslint-plugin": "^6.13.1",
    "@typescript-eslint/parser": "^6.13.1",
    "@rollup/plugin-typescript": "^11.1.5",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-commonjs": "^25.0.7",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.1",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.2",
    "prettier": "^3.1.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "rollup": "^4.6.1",
    "typedoc": "^0.25.4",
    "semantic-release": "^22.0.8",
    "docsify-cli": "^4.4.4"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-native": ">=0.72.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "react-native": {
      "optional": true
    }
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "files": ["dist", "platforms", "tools", "README.md", "CHANGELOG.md", "LICENSE"],
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  },
  "lint-staged": {
    "src/**/*.ts": ["eslint --fix", "prettier --write", "git add"]
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "roots": ["<rootDir>/src", "<rootDir>/__tests__"],
    "testMatch": ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
    "collectCoverageFrom": ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/index.ts"],
    "coverageThreshold": {
      "global": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    },
    "setupFilesAfterEnv": ["<rootDir>/__tests__/helpers/test-setup.ts"]
  }
}
```

### TypeScript Configuration

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/types/*": ["./src/types/*"],
      "@/platforms/*": ["./platforms/*"]
    }
  },
  "include": ["src/**/*", "platforms/**/*", "__tests__/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

#### tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "**/*.test.ts", "**/*.spec.ts", "__tests__/**/*", "examples/**/*"]
}
```

### Platform-Specific Entry Points

#### src/index.ts (Main Entry)

```typescript
// Core foundation exports
export * from './config-loader';
export * from './logger';
export * from './error-handler';
export * from './event-core';
export * from './event-publisher';
export * from './event-subscriber';
export * from './feature-toggle';
export * from './i18n-core';
export * from './metrics-sdk';
export * from './healthcheck';
export * from './saga-orchestrator';

// Type definitions
export * from './types';

// Platform utilities
export { detectPlatform, isPlatform } from './utils/platform-detection';

// Norwegian compliance utilities
export { validateNorwegianCompliance } from './utils/compliance';

// Multi-platform configuration
export { createPlatformConfig } from './utils/platform-config';
```

#### platforms/web/index.ts

```typescript
// Web-specific foundation exports
export * from '../../src';
export * from './web-logger';
export * from './web-events';
export * from './web-storage';

// Web-specific utilities
export { setupWebFoundation } from './setup';
export { WebStorageAdapter } from './storage-adapter';
export { BrowserMetricsCollector } from './metrics-collector';
```

#### platforms/mobile/index.ts

```typescript
// Mobile-specific foundation exports
export * from '../../src';
export * from './mobile-logger';
export * from './mobile-events';
export * from './mobile-storage';
export * from './offline-support';

// React Native specific utilities
export { setupMobileFoundation } from './setup';
export { AsyncStorageAdapter } from './storage-adapter';
export { MobileMetricsCollector } from './metrics-collector';
export { OfflineQueueManager } from './offline-queue';
```

#### platforms/desktop/index.ts

```typescript
// Desktop-specific foundation exports
export * from '../../src';
export * from './desktop-logger';
export * from './desktop-events';
export * from './desktop-storage';

// Electron specific utilities
export { setupDesktopFoundation } from './setup';
export { ElectronStorageAdapter } from './storage-adapter';
export { DesktopMetricsCollector } from './metrics-collector';
export { IPCEventBridge } from './ipc-bridge';
```

#### platforms/api/index.ts

```typescript
// API-specific foundation exports
export * from '../../src';
export * from './api-logger';
export * from './api-events';
export * from './api-metrics';

// NestJS/Fastify specific utilities
export { setupAPIFoundation } from './setup';
export { APIMetricsCollector } from './metrics-collector';
export { DistributedEventBus } from './distributed-events';
export { DatabaseHealthCheck } from './health-checks';
```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- TypeScript >= 5.0.0

### Quick Start

```bash
# Clone and install
git clone https://github.com/xalatechnologies/xala-foundation.git
cd xala-foundation
npm install

# Development
npm run dev          # Watch mode
npm run test:watch   # Test watch mode

# Building
npm run build        # Production build
npm run type-check   # TypeScript validation

# Testing
npm run test                 # All tests
npm run test:user-stories   # User story tests
npm run test:compliance     # Compliance tests
npm run test:platform       # Platform tests

# Compliance
npm run compliance:check    # Full compliance check
npm run compliance:nsm      # NSM compliance
npm run compliance:gdpr     # GDPR compliance

# Platform Development
npm run build:web      # Web platform build
npm run build:mobile   # Mobile platform build
npm run build:desktop  # Desktop platform build
npm run build:api      # API platform build
```

### Norwegian Municipal Development

```bash
# Generate municipal project
npm run generate:municipal drammen-booking

# Validate Norwegian compliance
npm run validate:norwegian

# Test with municipal data
npm run test:municipal
```

This foundation package provides the architectural bedrock for building Norwegian-compliant, multi-platform SaaS applications like the Drammen booking system, with dedicated support for web frontends, admin dashboards, mobile apps, desktop applications, and robust APIs.
