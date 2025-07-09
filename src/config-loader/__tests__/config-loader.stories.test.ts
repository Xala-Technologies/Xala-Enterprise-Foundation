/**
 * Config Loader User Story Tests
 * Tests real-world scenarios for Norwegian government-compliant configuration management
 */

import { loadConfig, getNorwegianComplianceConfig, getSecurityConfig } from '../index';

describe('Config Loader User Stories', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env };

    // Reset environment
    delete process.env.DATABASE_URL;
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
    delete process.env.MUNICIPALITY_CODE;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  // User Story 1: Norwegian municipality needs secure database connection
  it('Norwegian Municipality Story: should securely load database config for Trondheim Kommune', () => {
    // Given: Trondheim Kommune needs to connect to their municipal database
    process.env.DATABASE_URL =
      'postgresql://trondheim_user:secret@municipal-db.trondheim.no:5432/facility_booking';
    process.env.NODE_ENV = 'production';
    process.env.MUNICIPALITY_CODE = '5001'; // Trondheim

    // When: The system loads configuration
    const config = loadConfig({
      environment: 'production',
      enableNorwegianCompliance: true,
    });

    // Then: Configuration should be properly loaded and validated
    expect(config.environment).toBe('production');
    expect(config.norwegianCompliance).toBeDefined();

    // Verify Norwegian compliance is active
    const complianceConfig = getNorwegianComplianceConfig();
    expect(complianceConfig.nsm.securityClassification).toBeDefined();
    expect(complianceConfig.gdpr.enabled).toBe(true);
  });

  // User Story 2: Developer working locally needs quick config setup
  it('Developer Story: should provide sensible defaults for local development', () => {
    // Given: Developer starts working on booking system locally
    process.env.NODE_ENV = 'development';

    // When: Configuration is loaded without any database setup
    const config = loadConfig({
      environment: 'development',
      enableNorwegianCompliance: false,
    });

    // Then: System should work with development defaults
    expect(config.environment).toBe('development');
    expect(config.norwegianCompliance).toBeNull();
    expect(config.database.host).toBe('localhost');
    expect(config.logging.level).toBe('info');
  });

  // User Story 3: System admin needs to override config for emergency maintenance
  it('System Admin Story: should handle production configuration for maintenance scenarios', () => {
    // Given: System admin configures for production environment
    process.env.NODE_ENV = 'production';
    process.env.DB_HOST = 'production-db.oslo.no';
    process.env.LOG_LEVEL = 'warn';

    // When: Production configuration is loaded
    const config = loadConfig({
      environment: 'production',
      enableNorwegianCompliance: true,
    });

    // Then: System should have production-appropriate settings
    expect(config.environment).toBe('production');
    expect(config.norwegianCompliance).toBeDefined();
    expect(config.database.ssl).toBe(true);
    expect(config.logging.level).toBe('warn');
  });

  // User Story 4: Security team needs to validate all required compliance settings
  it('Security Team Story: should validate NSM compliance configuration', () => {
    // Given: Security team needs to ensure NSM compliance
    process.env.NSM_CLASSIFICATION = 'KONFIDENSIELT';

    // When: Configuration validation is performed
    const securityConfig = getSecurityConfig();
    const complianceConfig = getNorwegianComplianceConfig();

    // Then: All compliance requirements should be met
    expect(securityConfig.encryption.algorithm).toBe('AES-256-GCM');
    expect(securityConfig.authentication.mfaRequired).toBe(true);
    expect(complianceConfig.nsm.auditRequired).toBe(true);
    expect(complianceConfig.nsm.securityClassification).toBe('KONFIDENSIELT');
    expect(complianceConfig.gdpr.enabled).toBe(true);
  });

  // User Story 5: International client needs simplified config without Norwegian features
  it('International Client Story: should support simplified non-Norwegian configuration', () => {
    // Given: International client doesn't need Norwegian government integrations
    process.env.NODE_ENV = 'production';
    process.env.DB_HOST = 'international-db.example.com';

    // When: Configuration is loaded for international deployment
    const config = loadConfig({
      environment: 'production',
      enableNorwegianCompliance: false,
    });

    // Then: Norwegian-specific features should be disabled
    expect(config.environment).toBe('production');
    expect(config.norwegianCompliance).toBeNull();
    expect(config.security).toBeDefined();
    expect(config.database).toBeDefined();
    expect(config.logging).toBeDefined();
  });

  // Additional validation tests
  it('should handle missing configuration gracefully', () => {
    // When: No environment variables are set
    const config = loadConfig({
      environment: 'development',
    });

    // Then: Should provide safe defaults
    expect(config.environment).toBe('development');
    expect(config).toBeDefined();
  });

  it('should validate required Norwegian compliance settings', () => {
    // Given: Norwegian compliance is enabled
    process.env.NODE_ENV = 'production';
    process.env.NSM_CLASSIFICATION = 'BEGRENSET';

    // When: Loading Norwegian compliant configuration
    loadConfig({
      environment: 'production',
      enableNorwegianCompliance: true,
    });

    const complianceConfig = getNorwegianComplianceConfig();

    // Then: Should have Norwegian compliance properly configured
    expect(complianceConfig.nsm.securityClassification).toBe('BEGRENSET');
    expect(complianceConfig.nsm.auditRequired).toBe(true);
    expect(complianceConfig.nsm.encryptionRequired).toBe(true);
    expect(complianceConfig.gdpr.enabled).toBe(true);
    expect(complianceConfig.gdpr.dataProcessingBasis).toBe('public_task');
    expect(complianceConfig.digdir.interoperabilityStandards).toBe(true);
  });
});
