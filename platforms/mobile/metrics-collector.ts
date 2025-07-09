/**
 * Mobile Metrics Collector
 */

import { createLogger } from '../../src/logger/index.js';

const logger = createLogger({
  level: 'debug',
  auditEnabled: true,
  complianceEnabled: true,
});

export class MobileMetricsCollector {
  recordPerformance(operation: string, duration: number) {
    logger.debug('Mobile performance recorded', { operation, duration });
  }

  recordEvent(event: string, data: any) {
    logger.debug('Mobile event recorded', { event, data });
  }
}
