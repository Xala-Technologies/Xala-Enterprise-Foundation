/**
 * Foundation Package Index User Story Tests
 * Tests for main package exports, utilities, and configuration factories
 */

import {
  FOUNDATION_NAME,
  FOUNDATION_VERSION,
  NORWEGIAN_COMPLIANCE,
  createFoundationConfig,
  getFoundationHealth,
  initializeFoundation,
} from '../index';

describe('Foundation Package Index User Stories', () => {
  // User Story 1: Developer imports foundation package constants
  it('Developer Story: should provide package metadata and constants', () => {
    // Given: Developer needs package information

    // When: Developer accesses package metadata

    // Then: Should provide correct package information
    expect(FOUNDATION_VERSION).toBe('2.0.0');
    expect(FOUNDATION_NAME).toBe('@xala-technologies/foundation');

    // Norwegian compliance constants should be available
    expect(NORWEGIAN_COMPLIANCE.NSM_CLASSIFICATIONS).toEqual([
      'ÅPEN',
      'BEGRENSET',
      'KONFIDENSIELT',
      'HEMMELIG',
    ]);

    expect(NORWEGIAN_COMPLIANCE.GDPR_LEGAL_BASIS).toEqual([
      'consent',
      'contract',
      'legal_obligation',
      'vital_interests',
      'public_task',
      'legitimate_interests',
    ]);

    expect(NORWEGIAN_COMPLIANCE.DIGDIR_STANDARDS).toEqual({
      ACCESSIBILITY_LEVEL: 'AA',
      DATA_FORMATS: ['JSON', 'XML'],
      INTEROPERABILITY_REQUIRED: true,
    });
  });

  // User Story 2: Municipal IT admin configures foundation package
  it('Municipal Admin Story: should create comprehensive foundation configuration', () => {
    // Given: Municipal admin needs to configure the foundation for Oslo municipality

    // When: Admin creates foundation configuration with Norwegian compliance enabled
    const config = createFoundationConfig({
      enableNorwegianCompliance: true,
      enableAuditLogging: true,
      enableMetrics: true,
      enableHealthChecks: true,
      environment: 'production',
    });

    // Then: Configuration should include all Norwegian compliance features
    expect(config.version).toBe('2.0.0');
    expect(config.environment).toBe('production');
    expect(config.compliance.norwegian).toBe(true);
    expect(config.compliance.auditLogging).toBe(true);
    expect(config.compliance.nsm).toBe(true);
    expect(config.compliance.gdpr).toBe(true);
    expect(config.compliance.digdir).toBe(true);

    expect(config.features.metrics).toBe(true);
    expect(config.features.healthChecks).toBe(true);
    expect(config.features.events).toBe(true);
    expect(config.features.logging).toBe(true);
    expect(config.features.i18n).toBe(true);
    expect(config.features.sagas).toBe(true);

    expect(config.created).toBeInstanceOf(Date);
  });

  // User Story 3: Developer uses minimal configuration
  it('Developer Story: should create minimal configuration with defaults', () => {
    // Given: Developer wants minimal setup for development

    // When: Developer creates configuration without options
    const config = createFoundationConfig();

    // Then: Should use sensible defaults
    expect(config.compliance.norwegian).toBe(true);
    expect(config.compliance.auditLogging).toBe(true);
    expect(config.environment).toBe('test'); // Jest sets NODE_ENV to 'test'
    expect(config.features.metrics).toBe(true);
    expect(config.features.healthChecks).toBe(true);
  });

  // User Story 4: Operations team checks foundation health
  it('Operations Team Story: should provide comprehensive health check for foundation package', () => {
    // Given: Operations team needs to verify foundation package health

    // When: Team runs foundation health check
    const health = getFoundationHealth();

    // Then: Should provide detailed health information
    expect(health.status).toBe('healthy');
    expect(health.version).toBe('2.0.0');

    // Type guard to ensure we have a healthy response
    if (health.status === 'healthy') {
      // All modules should be marked as healthy
      expect(health.modules['config-loader']).toBe(true);
      expect(health.modules['feature-toggle']).toBe(true);
      expect(health.modules['logger']).toBe(true);
      expect(health.modules['error-handler']).toBe(true);
      expect(health.modules['event-core']).toBe(true);
      expect(health.modules['event-publisher']).toBe(true);
      expect(health.modules['event-subscriber']).toBe(true);
      expect(health.modules['metrics-sdk']).toBe(true);
      expect(health.modules['healthcheck']).toBe(true);
      expect(health.modules['i18n-core']).toBe(true);
      expect(health.modules['saga-orchestrator']).toBe(true);

      // Compliance features should be available
      expect(health.compliance.nsm).toBe(true);
      expect(health.compliance.gdpr).toBe(true);
      expect(health.compliance.digdir).toBe(true);
    }
  });

  // User Story 5: Application initializes foundation package
  it('Application Story: should initialize foundation package completely', async () => {
    // Given: Application needs to initialize foundation with Norwegian compliance

    // When: Application initializes foundation
    const result = await initializeFoundation({
      enableNorwegianCompliance: true,
      enableAuditLogging: true,
      enableMetrics: true,
      environment: 'staging',
    });

    // Then: Foundation should be fully initialized with expected configuration
    expect(result.version).toBe('2.0.0');
    expect(result.environment).toBe('staging');
    expect(result.compliance.gdprEnabled).toBe(true);
    expect(result.compliance.auditRequired).toBe(true);
    expect(result.compliance.encryptionRequired).toBe(true);
    expect(result.compliance.nsmClassification).toBe('BEGRENSET');
    expect(result.integrations.altinn.enabled).toBe(true);
    expect(result.integrations.digdir).toBe(true);
    expect(result.integrations.nsm).toBe(true);
    expect(result.initialized).toBe(true);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  // User Story 6: Security officer validates compliance constants
  it('Security Officer Story: should validate Norwegian compliance constants meet requirements', () => {
    // Given: Security officer needs to verify compliance constants

    // When: Officer checks NSM classifications
    const nsmClassifications = NORWEGIAN_COMPLIANCE.NSM_CLASSIFICATIONS;

    // Then: Classifications should match NSM standards
    expect(nsmClassifications).toHaveLength(4);
    expect(nsmClassifications.includes('ÅPEN')).toBe(true);
    expect(nsmClassifications.includes('BEGRENSET')).toBe(true);
    expect(nsmClassifications.includes('KONFIDENSIELT')).toBe(true);
    expect(nsmClassifications.includes('HEMMELIG')).toBe(true);

    // GDPR legal basis should be comprehensive
    const gdprBasis = NORWEGIAN_COMPLIANCE.GDPR_LEGAL_BASIS;
    expect(gdprBasis).toContain('consent');
    expect(gdprBasis).toContain('public_task'); // Important for government applications
    expect(gdprBasis).toContain('legal_obligation');

    // DigDir standards should be enforced
    const digdirStandards = NORWEGIAN_COMPLIANCE.DIGDIR_STANDARDS;
    expect(digdirStandards.ACCESSIBILITY_LEVEL).toBe('AA');
    expect(digdirStandards.INTEROPERABILITY_REQUIRED).toBe(true);
    expect(digdirStandards.DATA_FORMATS).toContain('JSON');
    expect(digdirStandards.DATA_FORMATS).toContain('XML');
  });

  // User Story 7: Environment-specific configuration
  it('Environment Story: should create different configurations for different environments', () => {
    // Given: Application runs in multiple environments

    // When: Configurations are created for different environments
    const devConfig = createFoundationConfig({ environment: 'development' });
    const prodConfig = createFoundationConfig({ environment: 'production' });
    const testConfig = createFoundationConfig({ environment: 'test' });

    // Then: Configurations should reflect environment differences
    expect(devConfig.environment).toBe('development');
    expect(prodConfig.environment).toBe('production');
    expect(testConfig.environment).toBe('test');

    // All should maintain compliance features
    [devConfig, prodConfig, testConfig].forEach(config => {
      expect(config.compliance.norwegian).toBe(true);
      expect(config.version).toBe('2.0.0');
      expect(config.features.logging).toBe(true);
    });
  });

  // User Story 8: Performance monitoring for configuration creation
  it('Performance Story: should create configuration efficiently', () => {
    // Given: Application needs fast configuration creation

    // When: Configuration is created multiple times
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      createFoundationConfig({
        enableNorwegianCompliance: true,
        enableMetrics: true,
      });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Then: Configuration creation should be fast
    expect(duration).toBeLessThan(100); // Less than 100ms for 100 configurations
  });
});
