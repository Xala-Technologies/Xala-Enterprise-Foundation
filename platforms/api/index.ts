/**
 * API Platform Entry Point
 * Server-side optimized version of Foundation
 */

// Re-export core foundation functionality
export * from '../../src/index';

// API-specific exports (specific exports to avoid conflicts)
export {
  publishEvent as publishApiEvent,
  subscribeToEvent as subscribeToApiEvent,
} from './api-events';
export * from './api-logger';
export * from './api-metrics';
export { DistributedEventBus } from './distributed-events';
export * from './health-checks';
export * from './metrics-collector';
export { setupApi } from './setup';

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
