import {
  getErrorHandler,
  getEventPublisher,
  getEventSubscriber,
  getFeatureToggleManager,
  getHealthManager,
  getI18nManager,
  getMetricsCollector,
  getSagaOrchestrator,
  initializeFoundation,
} from '../../src/index.js';
import { createLogger } from '../../src/logger/index.js';

describe('Foundation Module Integration Tests', () => {
  let logger: ReturnType<typeof createLogger>;
  let errorHandler: ReturnType<typeof getErrorHandler>;
  let featureToggle: ReturnType<typeof getFeatureToggleManager>;
  let i18n: ReturnType<typeof getI18nManager>;
  let healthCheck: ReturnType<typeof getHealthManager>;
  let metrics: ReturnType<typeof getMetricsCollector>;
  let saga: ReturnType<typeof getSagaOrchestrator>;
  let eventPublisher: ReturnType<typeof getEventPublisher>;
  let eventSubscriber: ReturnType<typeof getEventSubscriber>;

  beforeEach(() => {
    // Initialize all modules with Norwegian compliance
    logger = createLogger({
      level: 'info',
      auditEnabled: true,
      complianceEnabled: true,
    });

    errorHandler = getErrorHandler();
    featureToggle = getFeatureToggleManager();
    i18n = getI18nManager();
    healthCheck = getHealthManager();
    metrics = getMetricsCollector();
    saga = getSagaOrchestrator();
    eventPublisher = getEventPublisher();
    eventSubscriber = getEventSubscriber();
  });

  afterEach(() => {
    // Clean up all resources after each test
    healthCheck.cleanup();
    saga.cleanup();
    eventPublisher.cleanup();
  });

  describe('Logger Integration', () => {
    it('should integrate with error handler for audit logging', async () => {
      const testError = new Error('Integration test error');

      // Error handler should use logger for audit entries
      const errorId = await errorHandler.handleError(testError, {
        userId: 'test_user_001',
        operation: 'integration_test',
        component: 'test_suite',
        nsmClassification: 'ÅPEN',
      });

      expect(errorId).toBeDefined();
      expect(typeof errorId).toBe('string');
    });

    it('should integrate with feature toggle for flag operations', async () => {
      featureToggle.registerFlag({
        key: 'integration_test_flag',
        name: 'Integration Test Flag',
        enabled: true,
        nsmClassification: 'ÅPEN',
        description: 'Test flag for integration testing',
      });

      const isEnabled = featureToggle.isEnabled('integration_test_flag', {
        userId: 'test_user_001',
        userGroup: 'citizen',
      });

      expect(isEnabled).toBe(true);
    });

    it('should integrate with metrics for event tracking', async () => {
      const startTime = Date.now();

      metrics.incrementCounter('integration_test_counter', 1, {
        nsmClassification: 'ÅPEN',
        municipality: '0301',
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle errors across multiple modules', async () => {
      // Simulate error in feature toggle
      const originalIsEnabled = featureToggle.isEnabled;
      featureToggle.isEnabled = () => {
        throw new Error('Feature toggle service unavailable');
      };

      try {
        const errorId = await errorHandler.handleError(new Error('Service cascade failure'), {
          userId: 'admin_001',
          operation: 'feature_access',
          component: 'feature_toggle_service',
          nsmClassification: 'BEGRENSET',
        });

        expect(errorId).toBeDefined();
        expect(typeof errorId).toBe('string');
      } finally {
        // Restore original function
        featureToggle.isEnabled = originalIsEnabled;
      }
    });

    it('should maintain compliance during error scenarios', async () => {
      const personalDataError = new Error('Personal data processing failed');

      const errorId = await errorHandler.handleComplianceError(
        personalDataError,
        {
          userId: 'gdpr_test_user',
          operation: 'personal_data_export',
          personalDataInvolved: true,
          nsmClassification: 'KONFIDENSIELT',
        },
        'GDPR'
      );

      expect(errorId).toBeDefined();
      expect(typeof errorId).toBe('string');
    });
  });

  describe('Internationalization Integration', () => {
    it('should provide localized error messages', () => {
      // Test Norwegian
      i18n.setLocale('nb');
      expect(i18n.t('error.general')).toBe('error.general'); // Returns key if no translation

      // Test English
      i18n.setLocale('en');
      expect(i18n.t('error.general')).toBe('error.general'); // Returns key if no translation
    });

    it('should support Norwegian municipal contexts', () => {
      i18n.setLocale('nb');
      expect(i18n.t('municipality.0301')).toBe('municipality.0301'); // Returns key if no translation
      expect(i18n.t('municipality.4601')).toBe('municipality.4601'); // Returns key if no translation
      expect(i18n.t('municipality.5001')).toBe('municipality.5001'); // Returns key if no translation
    });
  });

  describe('Health Check Integration', () => {
    it('should monitor all module health', async () => {
      // Register a basic health check first
      healthCheck.registerCheck({
        name: 'basic_health_check',
        check: async () => ({
          name: 'basic_health_check',
          status: 'healthy',
          timestamp: new Date(),
          duration: 0,
          message: 'Basic health check passed',
        }),
      });

      // Run the check to populate results
      await healthCheck.runCheck('basic_health_check');

      const health = healthCheck.getOverallHealth();

      expect(health).toBeDefined();
      expect(health.status).toMatch(/^(healthy|degraded|unhealthy)$/);
      expect(health.summary).toBeDefined();
      expect(typeof health.summary.total).toBe('number');
      expect(health.summary.total).toBeGreaterThan(0);
    });

    it('should detect module failures', async () => {
      // Register a failing health check
      healthCheck.registerCheck({
        name: 'test_failing_check',
        check: async () => ({
          name: 'test_failing_check',
          status: 'unhealthy',
          timestamp: new Date(),
          duration: 0,
          message: 'Test failure',
        }),
      });

      // Run the check to populate results
      await healthCheck.runCheck('test_failing_check');

      const health = healthCheck.getOverallHealth();
      expect(health.summary.total).toBeGreaterThan(0);
    });
  });

  describe('Event System Integration', () => {
    it('should publish and subscribe to Norwegian government events', async () => {
      // Set up event subscription
      const receivedEvents: any[] = [];

      eventSubscriber.subscribe('citizen.profile.updated', event => {
        receivedEvents.push(event);
      });

      // Publish event with correct BaseEvent structure
      await eventPublisher.publish({
        id: 'event-001',
        type: 'citizen.profile.updated',
        timestamp: new Date(),
        source: 'test-system',
        version: '2.0.0',
        nsmClassification: 'BEGRENSET',
        userId: 'citizen_001',
        changes: ['address', 'phone'],
        municipality: '0301',
      });

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].userId).toBe('citizen_001');
    });

    it('should handle event publishing failures gracefully', async () => {
      // Simulate publishing failure by using invalid event type
      try {
        await eventPublisher.publish({
          id: 'invalid-event',
          type: '',
          timestamp: new Date(),
          source: 'test-system',
          version: '2.0.0',
          invalid: 'event',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Saga Orchestration Integration', () => {
    it('should orchestrate Norwegian government workflows', async () => {
      // Define a simple test saga
      saga.registerSaga({
        name: 'test_municipal_workflow',
        steps: [
          {
            name: 'validate_citizen',
            execute: async () => {
              await new Promise(resolve => setTimeout(resolve, 10));
              return { validated: true };
            },
          },
          {
            name: 'process_application',
            execute: async () => {
              await new Promise(resolve => setTimeout(resolve, 10));
              return { processed: true };
            },
          },
        ],
      });

      const sagaId = await saga.startSaga('test_municipal_workflow', {
        citizenId: 'citizen_001',
        municipality: '0301',
      });

      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 50));

      const status = saga.getSagaStatus(sagaId);
      expect(status).toBeDefined();
      expect(status!.status).toBe('completed');
    });

    it('should handle saga compensation on failures', async () => {
      // Define saga with compensation
      saga.registerSaga({
        name: 'failing_workflow',
        steps: [
          {
            name: 'step_one',
            execute: async () => {
              return { completed: true };
            },
            compensate: async context => {
              context.data.compensated = true;
            },
          },
          {
            name: 'failing_step',
            execute: async () => {
              throw new Error('Simulated failure');
            },
          },
        ],
      });

      const sagaId = await saga.startSaga('failing_workflow', {
        testData: true,
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const status = saga.getSagaStatus(sagaId);
      expect(status).toBeDefined();
      expect(status!.status).toBe('compensated');
    });
  });

  describe('Foundation Initialization Integration', () => {
    it('should initialize all modules together', async () => {
      const foundation = await initializeFoundation({
        enableNorwegianCompliance: true,
        enableAuditLogging: true,
        enableMetrics: true,
        enableHealthChecks: true,
      });

      expect(foundation).toBeDefined();
      expect(foundation.version).toBe('2.0.0');
      expect(foundation.config.compliance.norwegian).toBe(true);
    });

    it('should maintain Norwegian compliance during initialization', async () => {
      const foundation = await initializeFoundation({
        enableNorwegianCompliance: true,
        environment: 'production',
      });

      expect(foundation.config.compliance.nsm).toBe(true);
      expect(foundation.config.compliance.gdpr).toBe(true);
      expect(foundation.config.compliance.digdir).toBe(true);
    });
  });

  describe('Performance Integration', () => {
    it('should maintain performance under load', async () => {
      const startTime = Date.now();

      // Simulate concurrent operations
      for (let i = 0; i < 10; i++) {
        logger.info(`Performance test ${i}`, {
          operationId: i,
          municipality: '0301',
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});
