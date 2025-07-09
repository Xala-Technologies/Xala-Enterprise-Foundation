/**
 * Health Check User Story Tests
 * Tests real-world scenarios for Norwegian government-compliant health monitoring
 */

import {
  HealthManager,
  createHealthManager,
  getOverallHealth,
  registerHealthCheck,
  runHealthCheck,
} from '../index';

describe('Health Check User Stories', () => {
  let healthManager: HealthManager;

  beforeEach(() => {
    healthManager = createHealthManager({
      enableCompliance: true,
      enableAutoCheck: false, // Disable auto-check for tests
      timeout: 1000,
    });
  });

  afterEach(() => {
    // Clean up timeouts and resources after each test
    healthManager.cleanup();
  });

  // User Story 1: Operations team monitoring critical infrastructure
  it('Operations Team Story: should monitor critical infrastructure across Oslo Kommune', async () => {
    // Given: Operations team needs to monitor critical municipal services
    healthManager.registerInfrastructureChecks();

    // When: Infrastructure health checks are run
    const results = await healthManager.runAllChecks();
    const overallHealth = healthManager.getOverallHealth();

    // Then: All critical infrastructure should be monitored
    expect(results.database).toBeDefined();
    expect(results.memory).toBeDefined();
    expect(results.disk_space).toBeDefined();

    // Verify database as critical check
    expect(results.database.name).toBe('database');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(results.database.status);
    expect(results.database.timestamp).toBeInstanceOf(Date);
    expect(typeof results.database.duration).toBe('number');

    // Verify overall health calculation
    expect(['healthy', 'degraded', 'unhealthy']).toContain(overallHealth.status);
    expect(overallHealth.summary.total).toBeGreaterThan(0);
    expect(
      overallHealth.summary.healthy +
        overallHealth.summary.degraded +
        overallHealth.summary.unhealthy
    ).toBe(overallHealth.summary.total);

    const stats = healthManager.getStats();
    expect(stats.totalChecks).toBeGreaterThan(0);
    expect(stats.complianceEnabled).toBe(true);
  });

  // User Story 2: Compliance officer monitoring Norwegian standards
  it('Compliance Officer Story: should monitor Norwegian compliance standards', async () => {
    // Given: Compliance officer needs to track NSM, GDPR, and DigDir compliance
    healthManager.registerComplianceChecks();

    // When: Compliance checks are executed
    const results = await healthManager.runAllChecks();

    // Then: All compliance standards should be monitored
    expect(results.nsm_compliance).toBeDefined();
    expect(results.gdpr_compliance).toBeDefined();
    expect(results.digdir_interoperability).toBeDefined();

    // Verify NSM compliance check
    const nsmResult = results.nsm_compliance;
    expect(nsmResult.name).toBe('nsm_compliance');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(nsmResult.status);
    expect(nsmResult.nsmClassification).toBe('BEGRENSET');
    expect(nsmResult.message).toContain('NSM');

    // Verify GDPR compliance check
    const gdprResult = results.gdpr_compliance;
    expect(gdprResult.name).toBe('gdpr_compliance');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(gdprResult.status);
    expect(gdprResult.message).toContain('GDPR');

    // Verify DigDir interoperability check
    const digdirResult = results.digdir_interoperability;
    expect(digdirResult.name).toBe('digdir_interoperability');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(digdirResult.status);
    expect(digdirResult.message).toContain('DigDir');

    const stats = healthManager.getStats();
    expect(stats.totalChecks).toBe(3); // NSM, GDPR, DigDir
    expect(stats.complianceEnabled).toBe(true);
  });

  // User Story 3: Trondheim Kommune admin monitoring service health
  it('Municipality Admin Story: should monitor custom municipal services for Trondheim Kommune', async () => {
    // Given: Trondheim Kommune needs to monitor custom services

    // Register custom municipal service checks
    healthManager.registerCheck({
      name: 'citizen_portal',
      check: async () => ({
        name: 'citizen_portal',
        status: 'healthy' as const,
        timestamp: new Date(),
        duration: 120,
        message: 'Citizen portal responding normally',
        metadata: { activeUsers: 1250, responseTime: 120 },
      }),
      critical: true,
      tags: ['municipal', 'citizen_services'],
    });

    healthManager.registerCheck({
      name: 'booking_system',
      check: async () => ({
        name: 'booking_system',
        status: 'degraded' as const,
        timestamp: new Date(),
        duration: 300,
        message: 'Booking system experiencing high load',
        metadata: { queueLength: 45, averageResponseTime: 300 },
      }),
      critical: false,
      tags: ['municipal', 'booking'],
    });

    healthManager.registerCheck({
      name: 'payment_gateway',
      check: async () => ({
        name: 'payment_gateway',
        status: 'healthy' as const,
        timestamp: new Date(),
        duration: 80,
        message: 'Payment gateway operational',
        metadata: { transactionsPerHour: 150, errorRate: 0.1 },
      }),
      critical: true,
      tags: ['municipal', 'payments'],
    });

    // When: Municipal services are checked
    const results = await healthManager.runAllChecks();
    const overallHealth = healthManager.getOverallHealth();

    // Then: All municipal services should be monitored with proper status
    expect(results.citizen_portal.status).toBe('healthy');
    expect(results.citizen_portal.metadata?.activeUsers).toBe(1250);

    expect(results.booking_system.status).toBe('degraded');
    expect(results.booking_system.metadata?.queueLength).toBe(45);

    expect(results.payment_gateway.status).toBe('healthy');
    expect(results.payment_gateway.metadata?.transactionsPerHour).toBe(150);

    // Overall status should reflect degraded service but not unhealthy since no critical services failed
    expect(overallHealth.status).toBe('degraded');
    expect(overallHealth.summary.healthy).toBe(2);
    expect(overallHealth.summary.degraded).toBe(1);
    expect(overallHealth.summary.unhealthy).toBe(0);
  });

  // User Story 4: Developer debugging service issues
  it('Developer Story: should provide detailed diagnostics for debugging service failures', async () => {
    // Given: Developer needs to debug a failing service

    // Register a failing service check
    healthManager.registerCheck({
      name: 'user_authentication',
      check: async () => {
        throw new Error('Connection timeout to authentication service');
      },
      timeout: 2000,
      critical: true,
      tags: ['authentication', 'user_management'],
    });

    // Register a slow service check
    healthManager.registerCheck({
      name: 'document_storage',
      check: async () => {
        // Simulate slow response
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          name: 'document_storage',
          status: 'healthy' as const,
          timestamp: new Date(),
          duration: 100,
          message: 'Document storage accessible but slow',
          metadata: {
            connectionPool: 8,
            averageQueryTime: 450,
            diskUsage: 75.2,
          },
        };
      },
      timeout: 5000,
      critical: false,
      tags: ['storage', 'documents'],
    });

    // When: Developer runs health checks for debugging
    const authResult = await healthManager.runCheck('user_authentication');
    const storageResult = await healthManager.runCheck('document_storage');
    const overallHealth = healthManager.getOverallHealth();

    // Then: Detailed diagnostic information should be available
    expect(authResult.status).toBe('unhealthy');
    expect(authResult.message).toContain('Connection timeout');
    expect(authResult.duration).toBeGreaterThanOrEqual(0);
    expect(authResult.timestamp).toBeInstanceOf(Date);

    expect(storageResult.status).toBe('healthy');
    expect(storageResult.duration).toBeGreaterThanOrEqual(90);
    expect(storageResult.metadata?.connectionPool).toBe(8);
    expect(storageResult.metadata?.averageQueryTime).toBe(450);

    // Overall health should be unhealthy due to critical authentication failure
    expect(overallHealth.status).toBe('unhealthy');
    expect(overallHealth.summary.unhealthy).toBe(1);
    expect(overallHealth.summary.healthy).toBe(1);

    const stats = healthManager.getStats();
    expect(stats.totalChecks).toBe(2);
    expect(stats.lastResults).toBe(2);
  });

  // User Story 5: Security officer monitoring NSM classified system health
  it('Security Officer Story: should monitor NSM classified systems with proper security levels', async () => {
    // Given: Security officer needs to monitor classified systems

    // Register classified system checks
    healthManager.registerCheck({
      name: 'classified_database',
      check: async () => ({
        name: 'classified_database',
        status: 'healthy' as const,
        timestamp: new Date(),
        duration: 50,
        message: 'Classified database operational',
        nsmClassification: 'HEMMELIG' as const,
        metadata: {
          encryptionStatus: 'active',
          auditLogging: 'enabled',
          accessAttempts: 12,
        },
      }),
      critical: true,
      tags: ['classified', 'database', 'nsm'],
    });

    healthManager.registerCheck({
      name: 'security_monitoring',
      check: async () => ({
        name: 'security_monitoring',
        status: 'healthy' as const,
        timestamp: new Date(),
        duration: 75,
        message: 'Security monitoring systems active',
        nsmClassification: 'KONFIDENSIELT' as const,
        metadata: {
          intrusionDetection: 'active',
          logAnalysis: 'running',
          alertsSent: 0,
        },
      }),
      critical: true,
      tags: ['security', 'monitoring', 'nsm'],
    });

    healthManager.registerCheck({
      name: 'public_api',
      check: async () => ({
        name: 'public_api',
        status: 'healthy' as const,
        timestamp: new Date(),
        duration: 30,
        message: 'Public API functioning normally',
        nsmClassification: 'ÅPEN' as const,
        metadata: {
          requestsPerMinute: 450,
          errorRate: 0.2,
        },
      }),
      critical: false,
      tags: ['api', 'public'],
    });

    // When: Security systems are monitored
    const results = await healthManager.runAllChecks();

    // Then: NSM classifications should be properly tracked
    expect(results.classified_database.nsmClassification).toBe('HEMMELIG');
    expect(results.classified_database.metadata?.encryptionStatus).toBe('active');
    expect(results.classified_database.metadata?.auditLogging).toBe('enabled');

    expect(results.security_monitoring.nsmClassification).toBe('KONFIDENSIELT');
    expect(results.security_monitoring.metadata?.intrusionDetection).toBe('active');

    expect(results.public_api.nsmClassification).toBe('ÅPEN');
    expect(results.public_api.metadata?.requestsPerMinute).toBe(450);

    // All systems should be healthy
    const overallHealth = healthManager.getOverallHealth();
    expect(overallHealth.status).toBe('healthy');
    expect(overallHealth.summary.healthy).toBe(3);
    expect(overallHealth.summary.unhealthy).toBe(0);
  });

  // User Story 6: Operations center handling service degradation
  it('Operations Center Story: should properly categorize and respond to service degradation', async () => {
    // Given: Operations center monitors multiple services with different criticality

    // Register mixed health scenario
    healthManager.registerCheck({
      name: 'critical_payment_service',
      check: async () => ({
        name: 'critical_payment_service',
        status: 'unhealthy' as const,
        timestamp: new Date(),
        duration: 1500,
        message: 'Payment service database connection failed',
        metadata: { lastSuccessfulTransaction: '2025-01-15T10:30:00Z' },
      }),
      critical: true,
      tags: ['payments', 'critical'],
    });

    healthManager.registerCheck({
      name: 'backup_notification_service',
      check: async () => ({
        name: 'backup_notification_service',
        status: 'degraded' as const,
        timestamp: new Date(),
        duration: 800,
        message: 'Notification service queue backlog detected',
        metadata: { queueLength: 1250, processingRate: 'slow' },
      }),
      critical: false,
      tags: ['notifications', 'non_critical'],
    });

    healthManager.registerCheck({
      name: 'reporting_service',
      check: async () => ({
        name: 'reporting_service',
        status: 'healthy' as const,
        timestamp: new Date(),
        duration: 200,
        message: 'Reporting service operational',
        metadata: { reportsGenerated: 45, averageTime: 200 },
      }),
      critical: false,
      tags: ['reporting', 'analytics'],
    });

    // When: Operations center checks system health
    const results = await healthManager.runAllChecks();
    const overallHealth = healthManager.getOverallHealth();

    // Then: System should be categorized as unhealthy due to critical service failure
    expect(overallHealth.status).toBe('unhealthy');
    expect(overallHealth.summary.healthy).toBe(1);
    expect(overallHealth.summary.degraded).toBe(1);
    expect(overallHealth.summary.unhealthy).toBe(1);

    // Critical service failure should be identified
    expect(results.critical_payment_service.status).toBe('unhealthy');
    expect(results.backup_notification_service.status).toBe('degraded');
    expect(results.reporting_service.status).toBe('healthy');

    // Verify response times are tracked (actual execution time, not hardcoded values)
    expect(results.critical_payment_service.duration).toBeGreaterThanOrEqual(0);
    expect(results.backup_notification_service.duration).toBeGreaterThanOrEqual(0);
    expect(results.reporting_service.duration).toBeGreaterThanOrEqual(0);
  });

  // Test global convenience functions
  it('should support global convenience functions for health monitoring', async () => {
    // Given: Global health functions are available

    // Register a check using global function
    registerHealthCheck({
      name: 'global_service',
      check: async () => ({
        name: 'global_service',
        status: 'healthy' as const,
        timestamp: new Date(),
        duration: 100,
        message: 'Global service operational',
      }),
      critical: false,
      tags: ['global'],
    });

    // When: Global functions are used
    const result = await runHealthCheck('global_service');
    const overallHealth = getOverallHealth();

    // Then: Global functions should work correctly
    expect(result.name).toBe('global_service');
    expect(result.status).toBe('healthy');
    expect(result.duration).toBeGreaterThanOrEqual(0); // Actual execution time

    expect(overallHealth.status).toBe('healthy');
    expect(overallHealth.summary.healthy).toBe(1);
  });

  // Test error handling and timeouts
  it('should handle check timeouts and errors gracefully', async () => {
    // Given: Health check that times out
    healthManager.registerCheck({
      name: 'timeout_service',
      check: async () => {
        // Simulate a hanging service
        await new Promise(resolve => setTimeout(resolve, 10000));
        return {
          name: 'timeout_service',
          status: 'healthy' as const,
          timestamp: new Date(),
          duration: 10000,
          message: 'This should not complete',
        };
      },
      timeout: 100, // Very short timeout
      critical: true,
      tags: ['timeout_test'],
    });

    // When: Timeout check is run
    const result = await healthManager.runCheck('timeout_service');

    // Then: Timeout should be handled gracefully
    expect(result.status).toBe('unhealthy');
    expect(result.message).toContain('timeout');
    expect(result.duration).toBeLessThan(200); // Should timeout quickly
  });

  // Test check registration and management
  it('should manage health check registration and unregistration', () => {
    // Given: Health manager with some checks
    healthManager.registerCheck({
      name: 'test_service_1',
      check: async () => ({
        name: 'test_service_1',
        status: 'healthy' as const,
        timestamp: new Date(),
        duration: 50,
        message: 'Test service 1 operational',
      }),
    });

    healthManager.registerCheck({
      name: 'test_service_2',
      check: async () => ({
        name: 'test_service_2',
        status: 'healthy' as const,
        timestamp: new Date(),
        duration: 75,
        message: 'Test service 2 operational',
      }),
    });

    // When: Checks are registered and unregistered
    let stats = healthManager.getStats();
    expect(stats.totalChecks).toBe(2);

    const removed = healthManager.unregisterCheck('test_service_1');
    expect(removed).toBe(true);

    stats = healthManager.getStats();
    expect(stats.totalChecks).toBe(1);

    // Attempting to remove non-existent check
    const notRemoved = healthManager.unregisterCheck('non_existent_service');
    expect(notRemoved).toBe(false);

    stats = healthManager.getStats();
    expect(stats.totalChecks).toBe(1);
  });
});
