// Global teardown that runs once after all tests
export default async function globalTeardown() {
  console.log('🧹 Foundation Test Suite - Global Teardown');

  // Clean up test data
  const fs = require('fs');
  const path = require('path');

  const testDataDir = path.join(__dirname, '../test-data');

  if (fs.existsSync(testDataDir)) {
    try {
      // Remove all test data files
      const files = fs.readdirSync(testDataDir);
      files.forEach((file: string) => {
        const filePath = path.join(testDataDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });

      // Remove the test data directory
      fs.rmdirSync(testDataDir);

      console.log('✅ Test data cleanup completed');
    } catch (error) {
      console.warn('⚠️  Warning: Could not fully clean up test data:', error);
    }
  }

  // Clean up environment variables
  delete process.env.FOUNDATION_ENVIRONMENT;
  delete process.env.FOUNDATION_MUNICIPALITY;
  delete process.env.FOUNDATION_LANGUAGE;
  delete process.env.FOUNDATION_NSM_CLASSIFICATION;
  delete process.env.FOUNDATION_GDPR_ENABLED;
  delete process.env.FOUNDATION_AUDIT_REQUIRED;

  // Stop all metrics collectors to clear their timers
  try {
    const { getMetricsCollector } = await import('../src/metrics-sdk');
    const metricsCollector = getMetricsCollector();
    metricsCollector.stop();
    metricsCollector.clear();
    console.log('✅ Metrics collectors stopped and cleared');
  } catch (error) {
    console.log('⚠️  Error stopping metrics collectors:', error);
  }

  // Clear any remaining timers
  const timers = require('timers');
  if (timers.clearImmediate) {
    // Clear any immediate callbacks
    const immediateIds = (process as any)._getActiveHandles?.() || [];
    immediateIds.forEach((handle: any) => {
      if (handle && typeof handle.close === 'function') {
        try {
          handle.close();
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    });
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    console.log('🗑️  Garbage collection performed');
  }

  // Add a small delay to ensure cleanup completes
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('✅ Foundation Test Suite - Global Teardown Complete');
}
