const path = require('path');

// Determine if we're running in GitHub Actions
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: process.cwd(),
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/tests/**/*.test.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',

  // Apply these settings for both local and CI to prevent hanging
  testTimeout: 30000,
  maxWorkers: isGitHubActions ? 2 : '50%', // Limit workers to prevent resource exhaustion
  forceExit: true, // Force exit to prevent hanging
  detectOpenHandles: isGitHubActions ? false : true, // Show open handles locally, hide in CI
  verbose: true,

  // Handle TypeScript properly
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: false, // Use CommonJS for better Jest compatibility
        tsconfig: {
          module: 'commonjs',
        },
      },
    ],
  },

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Ignore node_modules except for ESM modules that need transformation
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
};
