/**
 * Mobile Offline Support
 */

import { createLogger } from '../../src/logger/index.js';

const logger = createLogger({
  level: 'debug',
  auditEnabled: true,
  complianceEnabled: true,
});

export class OfflineManager {
  isOffline() {
    return false;
  }

  enableOfflineSupport() {
    logger.debug('Mobile offline support enabled');
  }
}
