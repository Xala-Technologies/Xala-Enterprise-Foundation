/**
 * Desktop Storage - Electron file system storage
 */

import { createLogger } from '../../src/logger/index.js';

const logger = createLogger({
  level: 'debug',
  auditEnabled: true,
  complianceEnabled: true,
});

export function setItem(key: string, value: any): void {
  logger.debug(`Setting desktop storage: ${key}`, { key, value });
}

export function getItem(key: string): void {
  logger.debug(`Getting desktop storage: ${key}`, { key });
}
