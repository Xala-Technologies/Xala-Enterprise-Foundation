/**
 * Desktop Platform Entry Point
 * Electron-optimized version of Foundation
 */

// Re-export core foundation functionality
export * from '../../src/index';

// Desktop-specific exports (specific exports to avoid conflicts)
export {
  publishEvent as publishDesktopEvent,
  subscribeToEvent as subscribeToDesktopEvent,
} from './desktop-events';
export * from './desktop-logger';
export * from './desktop-storage';
export { IPCEventBridge } from './ipc-bridge';
export { DesktopMetricsCollector } from './metrics-collector';
export { setupDesktopFoundation } from './setup';
export { ElectronStorageAdapter } from './storage-adapter';

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
