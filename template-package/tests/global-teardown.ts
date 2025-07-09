/**
 * Global Test Teardown - {{PACKAGE_NAME}} Package
 * Ensures all resources are properly cleaned up after test suites
 */

export default async function globalTeardown() {
  console.log('🧹 {{PACKAGE_NAME}} Package - Global Test Teardown');

  try {
    // Clean up any module-specific resources
    // Add your module cleanup logic here

    // Generic cleanup
    if (global.gc) {
      global.gc();
    }

    // Clean up test artifacts
    const fs = require('fs');
    const path = require('path');

    // Remove test data directory if it exists
    const testDataPath = path.join(process.cwd(), 'test-data');
    if (fs.existsSync(testDataPath)) {
      fs.rmSync(testDataPath, { recursive: true, force: true });
    }

    console.log('✅ {{PACKAGE_NAME}} Package - Global Test Teardown Complete');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
    // Don't fail the test suite on cleanup errors
  }
}
