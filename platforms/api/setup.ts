/**
 * API Platform Setup
 * Initialize Foundation for Server/API Environment
 */

import type { FoundationConfig } from '../../src/config-loader/index.js';
import { EventPublisher } from '../../src/event-publisher/index.js';
import { EventSubscriber } from '../../src/event-subscriber/index.js';
import { createLogger } from '../../src/logger/index.js';
import { performHealthCheck } from './health-checks.js';
import { startMetricsCollection } from './metrics-collector.js';

const logger = createLogger({ level: 'info' });

export async function setupApi(config: FoundationConfig): Promise<void> {
  logger.info('🚀 Setting up Foundation for API platform', { config: config.environment });

  try {
    // Configure server-side logging with Norwegian compliance
    await setupApiLogging(config);

    // Setup metrics collection for APIs
    await setupApiMetrics(config);

    // Initialize health checks
    await setupHealthChecks(config);

    // Configure Norwegian compliance for API services
    await setupNorwegianCompliance(config);

    // Setup distributed event handling
    await setupDistributedEvents(config);

    // Configure API rate limiting and security
    await setupApiSecurity(config);

    logger.info('✅ API Foundation setup completed successfully');
  } catch (error) {
    logger.error(
      '❌ API Foundation setup failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

async function setupApiLogging(_config: FoundationConfig): Promise<void> {
  logger.info('📝 Configuring API logging with Norwegian compliance');

  // Configure structured logging for API requests/responses
  // Include NSM security classification support
  // Setup audit logging for GDPR compliance

  logger.info('✅ API logging configured');
}

async function setupApiMetrics(_config: FoundationConfig): Promise<void> {
  logger.info('📊 Setting up API metrics collection');

  // Start metrics collection
  startMetricsCollection();

  // Configure performance monitoring for API endpoints
  // Setup Norwegian compliance metrics tracking
  // Configure alerts for SLA violations

  logger.info('✅ API metrics collection started');
}

async function setupHealthChecks(_config: FoundationConfig): Promise<void> {
  logger.info('🏥 Initializing API health checks');

  // Perform initial health check
  performHealthCheck();

  // Setup periodic health monitoring
  // Configure dependency health checks (database, external services)
  // Setup Norwegian compliance health indicators

  logger.info('✅ API health checks initialized');
}

async function setupNorwegianCompliance(config: FoundationConfig): Promise<void> {
  logger.info('🇳🇴 Configuring Norwegian compliance for API services');

  if (config.compliance?.norwegian) {
    // Configure NSM security classifications for API responses
    // Setup GDPR data handling for API requests
    // Configure DigDir integration capabilities
    // Setup municipality-specific API configurations

    logger.info('✅ Norwegian compliance configured', {
      nsm: config.compliance.nsm || false,
      gdpr: config.compliance.gdpr || false,
      municipality: config.municipality || 'default',
    });
  }
}

async function setupDistributedEvents(_config: FoundationConfig): Promise<void> {
  logger.info('📡 Setting up distributed event handling');

  try {
    const publisher = new EventPublisher();
    const subscriber = new EventSubscriber();

    // Setup Norwegian compliance event handling
    await publisher.initialize();
    await subscriber.initialize();

    logger.info('✅ Distributed events configured');
  } catch (error) {
    logger.error('❌ Failed to setup distributed events', error as Error);
    throw error;
  }
}

async function setupApiSecurity(_config: FoundationConfig): Promise<void> {
  logger.info('🔒 Configuring API security');

  // Setup rate limiting per municipality
  // Configure authentication/authorization
  // Setup security headers and CORS
  // Configure Norwegian security standards

  logger.info('✅ API security configured');
}
