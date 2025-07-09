/**
 * Mobile Platform Entry Point
 * React Native optimized version of Foundation
 */

// Re-export core foundation functionality
export * from '../../src/index.js';

// Mobile-specific exports (specific exports to avoid conflicts)
export {
  publishEvent as publishMobileEvent,
  subscribeToEvent as subscribeToMobileEvent,
} from './mobile-events.js';
export * from './mobile-logger.js';
export * from './mobile-storage.js';
export * from './storage-adapter.js';
export * from './metrics-collector.js';
export * from './offline-support.js';
export * from './offline-queue.js';
export { setupMobile } from './setup.js';

// Platform detection
export const PLATFORM = 'mobile' as const;

// Mobile Foundation configuration interface
export interface MobileFoundationConfig {
  municipality?: string;
  language?: 'nb' | 'nn' | 'en';
  offline?: boolean;
  storage?: 'async-storage' | 'secure-storage';
  analytics?: boolean;
  debug?: boolean;
}
