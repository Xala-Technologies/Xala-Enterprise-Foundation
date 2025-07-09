/**
 * Mobile Logger Implementation
 * React Native optimized logging with Norwegian compliance
 */

import { createLogger } from '../../src/logger';

export class MobileLogger {
  private baseLogger: any;
  private name: string;

  constructor(name: string, config?: any) {
    this.name = name;
    // Use the correct createLogger signature with options object
    this.baseLogger = createLogger({
      level: config?.level || 'info',
      auditEnabled: config?.auditEnabled !== false,
      complianceEnabled: config?.complianceEnabled !== false,
    });
  }

  /**
   * Log with mobile context
   */
  info(message: string, metadata?: any) {
    const mobileMetadata = {
      ...metadata,
      logger: this.name,
      platform: 'mobile',
      timestamp: new Date().toISOString(),
      deviceInfo: this.getDeviceInfo(),
    };

    return this.baseLogger.info(message, mobileMetadata);
  }

  warn(message: string, metadata?: any) {
    const mobileMetadata = {
      ...metadata,
      logger: this.name,
      platform: 'mobile',
      timestamp: new Date().toISOString(),
      deviceInfo: this.getDeviceInfo(),
    };

    return this.baseLogger.warn(message, mobileMetadata);
  }

  error(message: string, metadata?: any) {
    const mobileMetadata = {
      ...metadata,
      logger: this.name,
      platform: 'mobile',
      timestamp: new Date().toISOString(),
      deviceInfo: this.getDeviceInfo(),
      stackTrace: new Error().stack,
    };

    return this.baseLogger.error(message, undefined, mobileMetadata);
  }

  /**
   * NSM classified logging for mobile
   */
  nsmLog(classification: string, message: string, metadata?: any) {
    const mobileMetadata = {
      ...metadata,
      logger: this.name,
      platform: 'mobile',
      deviceInfo: this.getDeviceInfo(),
      timestamp: new Date().toISOString(),
      nsmClassification: classification,
    };

    return this.baseLogger.info(`[${classification}] ${message}`, mobileMetadata);
  }

  private getDeviceInfo() {
    // Basic device info that's available in React Native
    return {
      platform: 'mobile',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Create mobile-optimized logger
 */
export function createMobileLogger(name: string, config?: any) {
  return new MobileLogger(name, config);
}
