/**
 * API Platform Entry Point
 * Server-side optimized version of Foundation
 */

// Re-export core foundation functionality
export * from '../../src/index.js';

// API-specific exports (specific exports to avoid conflicts)
export {
  publishEvent as publishApiEvent,
  subscribeToEvent as subscribeToApiEvent,
} from './api-events.js';
export * from './api-logger.js';
export * from './api-metrics.js';
export * from './health-checks.js';
export * from './metrics-collector.js';
export { setupApi } from './setup.js';
export { DistributedEventBus } from './distributed-events.js';

// Platform detection
export const PLATFORM = 'api' as const;

// API Foundation configuration interface
export interface APIFoundationConfig {
  municipality?: string;
  language?: 'nb' | 'nn' | 'en';
  database?: boolean;
  distributed?: boolean;
  monitoring?: boolean;
  debug?: boolean;
}
