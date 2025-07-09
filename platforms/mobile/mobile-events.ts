/**
 * Mobile Events - React Native event handling
 */

import { createLogger } from '../../src/logger/index.js';

const logger = createLogger({
  level: 'debug',
  auditEnabled: true,
  complianceEnabled: true,
});

export function publishEvent(eventName: string, data: any): void {
  logger.debug(`Publishing mobile event: ${eventName}`, { eventName, data });
}

export function subscribeToEvent(eventName: string, _handler: (data: any) => void): void {
  logger.debug(`Subscribing to mobile event: ${eventName}`, { eventName });
}
