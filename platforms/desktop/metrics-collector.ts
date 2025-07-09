/**
 * Desktop Metrics Collector
 */

import { createLogger } from '../../src/logger/index.js';

// Create logger with proper options object
const logger = createLogger({ level: 'info' });

let collectionInterval: NodeJS.Timeout | null = null;
let isCollecting = false;

export async function collectDesktopMetrics(): Promise<{
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  uptime: number;
  platform: NodeJS.Platform;
  arch: NodeJS.Architecture;
  nodeVersion: string;
  timestamp: string;
}> {
  if (typeof process === 'undefined') {
    logger.warn('⚠️ Desktop metrics not available - not in Node.js environment');
    return {
      memory: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 },
      cpu: { user: 0, system: 0 },
      uptime: 0,
      platform: 'linux' as NodeJS.Platform,
      arch: 'x64' as NodeJS.Architecture,
      nodeVersion: 'unknown',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // Collect system resource metrics
    const metrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };

    logger.info('📊 Desktop metrics collected', metrics);
    return metrics;
  } catch (error) {
    logger.error(
      '❌ Failed to collect desktop metrics',
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      memory: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 },
      cpu: { user: 0, system: 0 },
      uptime: 0,
      platform: 'linux' as NodeJS.Platform,
      arch: 'x64' as NodeJS.Architecture,
      nodeVersion: 'unknown',
      timestamp: new Date().toISOString(),
    };
  }
}

export class DesktopMetricsCollector {
  static instance: DesktopMetricsCollector;

  static getInstance(): DesktopMetricsCollector {
    if (!DesktopMetricsCollector.instance) {
      DesktopMetricsCollector.instance = new DesktopMetricsCollector();
    }
    return DesktopMetricsCollector.instance;
  }

  collect(): void {
    collectDesktopMetrics();
  }

  start(intervalMs: number = 60000): void {
    if (isCollecting) {
      logger.warn('⚠️ Desktop metrics collection already running');
      return;
    }

    logger.info('🚀 Starting desktop metrics collection', { intervalMs });
    isCollecting = true;

    // Collect initial metrics
    this.collect();

    // Set up periodic collection
    collectionInterval = setInterval(() => {
      this.collect();
    }, intervalMs);

    logger.info('✅ Desktop metrics collection started');
  }

  stop(): void {
    if (!isCollecting) {
      logger.warn('⚠️ Desktop metrics collection not running');
      return;
    }

    logger.info('🛑 Stopping desktop metrics collection');

    if (collectionInterval) {
      clearInterval(collectionInterval);
      collectionInterval = null;
    }

    isCollecting = false;
    logger.info('✅ Desktop metrics collection stopped');
  }

  isRunning(): boolean {
    return isCollecting;
  }
}
