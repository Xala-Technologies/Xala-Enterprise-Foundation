const path = require('path');

// Determine if we're running in GitHub Actions
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

// Get the correct root directory for GitHub Actions
const getRootDir = () => {
  if (isGitHubActions) {
    // In GitHub Actions, use GITHUB_WORKSPACE which points to the correct directory
    const workspaceDir = process.env.GITHUB_WORKSPACE;
    if (workspaceDir) {
      return workspaceDir;
    }

    // Fallback: handle the nested directory structure issue
    const currentDir = process.cwd();

    // Check if we're in the nested directory structure
    if (currentDir.includes('/Xala-Enterprise-Foundation')) {
      // Navigate up to the correct directory level
      const correctDir = currentDir.replace(
        '/Xala-Enterprise-Foundation',
        '/Xala-Enterprise-Foundation'
      );
      console.log(
        `GitHub Actions: Correcting nested directory from ${currentDir} to ${correctDir}`
      );
      return correctDir;
    }

    // If we're already in the correct directory structure
    if (
      currentDir.includes('/Xala-Enterprise-Foundation') &&
      !currentDir.includes('/Xala-Enterprise-Foundation')
    ) {
      return currentDir;
    }
  }
  return process.cwd(); // Return current working directory for local development
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
    maxWorkers: 2, // Limit workers in CI to avoid resource issues
    forceExit: true, // Force exit to prevent hanging in CI
    detectOpenHandles: false, // Disable in CI to avoid warnings
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
  // Module name mapping for ES modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': path.join(rootDir, 'src/$1'),
  },
};
