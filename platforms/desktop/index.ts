/**
 * Desktop Platform Entry Point
 * Electron-optimized version of Foundation
 */

// Re-export core foundation functionality
export * from '../../src/index.js';

// Desktop-specific exports (specific exports to avoid conflicts)
export {
  publishEvent as publishDesktopEvent,
  subscribeToEvent as subscribeToDesktopEvent,
} from './desktop-events.js';
export * from './desktop-logger.js';
export * from './desktop-storage.js';
export { setupDesktopFoundation } from './setup.js';
export { ElectronStorageAdapter } from './storage-adapter.js';
export { IPCEventBridge } from './ipc-bridge.js';
export { DesktopMetricsCollector } from './metrics-collector.js';

// Platform detection
export const PLATFORM = 'desktop' as const;

// Desktop Foundation configuration interface
export interface DesktopFoundationConfig {
  municipality?: string;
  language?: 'nb' | 'nn' | 'en';
  electron?: boolean;
  ipc?: boolean;
  fileSystem?: boolean;
  debug?: boolean;
}
