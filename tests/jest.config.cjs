module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '..',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts',
    '**/tests/**/*.test.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'platforms/**/*.ts',
    'tools/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.stories.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
      collectCoverageFrom: ['src/**/*.ts']
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      testTimeout: 60000
    },
    {
      displayName: 'Platform Tests',
      testMatch: ['<rootDir>/tests/platforms/**/*.test.ts'],
      testTimeout: 30000
    },
    {
      displayName: 'Compliance Tests',
      testMatch: ['<rootDir>/tests/compliance/**/*.test.ts'],
      testTimeout: 45000
    },
    {
      displayName: 'Performance Tests',
      testMatch: ['<rootDir>/tests/performance/**/*.test.ts'],
      testTimeout: 120000
    },
    {
      displayName: 'End-to-End Tests',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
      testTimeout: 180000
    }
  ],
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts'
}; 