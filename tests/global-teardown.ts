/**
 * Global Test Teardown
 * Ensures all resources are properly cleaned up after test suites
 */

import { getEventPublisher } from '../src/event-publisher';
import { getHealthManager } from '../src/healthcheck';
import { getMetricsCollector } from '../src/metrics-sdk';
import { getSagaOrchestrator } from '../src/saga-orchestrator';

export default async function globalTeardown() {
  console.log('🧹 Foundation Test Suite - Global Teardown');

  try {
    // Clean up saga orchestrator
    const sagaOrchestrator = getSagaOrchestrator();
    sagaOrchestrator.cleanup();

    // Clean up health manager
    const healthManager = getHealthManager();
    healthManager.cleanup();

    // Clean up event publisher
    const eventPublisher = getEventPublisher();
    eventPublisher.cleanup();

    // Stop all metrics collectors
    const metricsCollector = getMetricsCollector();
    metricsCollector.stop();

    console.log('✅ Test data cleanup completed');
    console.log('✅ Metrics collectors stopped and cleared');
    console.log('✅ All timeout handles cleared');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
  }

  console.log('✅ Foundation Test Suite - Global Teardown Complete');
}
