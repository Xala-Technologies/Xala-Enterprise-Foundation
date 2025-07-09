/**
 * Mobile Platform Entry Point
 * React Native optimized version of Foundation
 */

// Re-export core foundation functionality
export * from '../../src/index';

// Mobile-specific exports (specific exports to avoid conflicts)
export * from './metrics-collector';
export {
  publishEvent as publishMobileEvent,
  subscribeToEvent as subscribeToMobileEvent,
} from './mobile-events';
export * from './mobile-logger';
export * from './mobile-storage';
export * from './offline-queue';
export * from './offline-support';
export { setupMobile } from './setup';
export * from './storage-adapter';

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
