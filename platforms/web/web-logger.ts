/**
 * Web Logger Implementation
 * Browser-optimized logging with Norwegian compliance
 */

import { createLogger } from '../../src/logger';

export class WebLogger {
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
   * Log with browser context
   */
  info(message: string, metadata?: any) {
    const webMetadata = {
      ...metadata,
      logger: this.name,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
      platform: 'web',
    };

    return this.baseLogger.info(message, webMetadata);
  }

  warn(message: string, metadata?: any) {
    const webMetadata = {
      ...metadata,
      logger: this.name,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
      platform: 'web',
    };

    return this.baseLogger.warn(message, webMetadata);
  }

  error(message: string, metadata?: any) {
    const webMetadata = {
      ...metadata,
      logger: this.name,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
      platform: 'web',
      stack: new Error().stack,
    };

    return this.baseLogger.error(message, undefined, webMetadata);
  }

  /**
   * NSM classified logging for web
   */
  nsmLog(classification: string, message: string, metadata?: any) {
    const webMetadata = {
      ...metadata,
      logger: this.name,
      platform: 'web',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      sessionId:
        typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem('foundation-session-id')
          : null,
      timestamp: new Date().toISOString(),
      nsmClassification: classification,
    };

    return this.baseLogger.info(`[${classification}] ${message}`, webMetadata);
  }
}

/**
 * Create web-optimized logger
 */
export function createWebLogger(name: string, config?: any) {
  return new WebLogger(name, config);
}
