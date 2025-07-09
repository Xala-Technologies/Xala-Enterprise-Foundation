/**
 * Web Platform Entry Point
 * Browser-optimized version of Foundation
 */

// Re-export core foundation functionality
export * from '../../src/index.js';

// Web-specific exports
export * from './metrics-collector.js';
export { setupWeb } from './setup.js';
export { WebStorageAdapter as BrowserStorageAdapter } from './storage-adapter.js';
export * from './web-events.js';
export * from './web-logger.js';
export * from './web-storage.js';

// New Web Foundation exports
export {
  WebFoundation,
  setupWebFoundation,
  type StorageMetadata,
  type WebAccessibilityInterface,
  type WebAnalyticsInterface,
  type WebFoundationInstance,
  type WebLoggerInterface,
  type WebMetricsInterface,
  type WebSecurityInterface,
  type WebStorageInterface,
} from './setup.js';

// Platform detection
export const PLATFORM = 'web' as const;

// Web Foundation configuration interface
export interface WebFoundationConfig {
  municipality?: string;
  language?: 'nb' | 'nn' | 'en';
  localStorage?: boolean;
  sessionStorage?: boolean;
  analytics?: boolean;
  debug?: boolean;
  compliance?: {
    nsmClassification?: string;
    gdprEnabled?: boolean;
    auditRequired?: boolean;
    retentionPeriod?: string;
  };
  modules?: {
    webStorage?: any;
    webLogger?: any;
    webAnalytics?: any;
    webMetrics?: any;
    webAccessibility?: any;
    webSecurity?: any;
  };
}
