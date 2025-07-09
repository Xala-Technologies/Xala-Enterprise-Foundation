/**
 * Global Test Setup - {{PACKAGE_NAME}} Package
 * Initializes test environment and resources
 */

export default async function globalSetup() {
  console.log('🚀 {{PACKAGE_NAME}} Package - Global Test Setup');

  try {
    // Set up test environment
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests

    // Create test data directory
    const fs = require('fs');
    const path = require('path');

    const testDataPath = path.join(process.cwd(), 'test-data');
    if (!fs.existsSync(testDataPath)) {
      fs.mkdirSync(testDataPath, { recursive: true });
    }

    // Set up test configuration
    const testConfig = {
      enableCompliance: true,
      enableAuditLogging: true,
      enableMetrics: false, // Disable metrics in tests to reduce noise
      norwegianCompliance: {
        municipality: '0301', // Oslo (default for tests)
        language: 'nb',
        nsmClassification: 'ÅPEN',
        gdprEnabled: true,
        auditRequired: true,
      },
    };

    // Write test configuration file
    const configPath = path.join(testDataPath, 'test-config.json');
    fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

    console.log('✅ {{PACKAGE_NAME}} Package - Global Test Setup Complete');
    console.log(`📁 Test data created in: ${testDataPath}`);
    console.log(`🏛️  Municipality: ${testConfig.norwegianCompliance.municipality}`);
    console.log(`🌍 Language: ${testConfig.norwegianCompliance.language}`);
    console.log(`🔒 NSM Classification: ${testConfig.norwegianCompliance.nsmClassification}`);
    console.log(`📋 GDPR Enabled: ${testConfig.norwegianCompliance.gdprEnabled}`);
    console.log(`🔍 Audit Required: ${testConfig.norwegianCompliance.auditRequired}`);
  } catch (error) {
    console.error('❌ Error during global setup:', error);
    throw error; // Fail the test suite if setup fails
  }
}
