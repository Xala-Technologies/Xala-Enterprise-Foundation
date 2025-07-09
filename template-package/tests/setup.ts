/**
 * Test Setup - {{PACKAGE_NAME}} Package
 * Configures Jest environment and reduces test noise
 */

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Configure timeouts for tests
jest.setTimeout(10000); // 10 second timeout

// Clean up after each test
afterEach(async () => {
  // Add cleanup logic here if needed
  // Example: clear timers, close connections, etc.
});

export {};
