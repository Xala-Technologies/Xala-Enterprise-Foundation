/**
 * Desktop IPC Bridge
 */

import { createLogger } from '../../src/logger/index.js';

const logger = createLogger({
  level: 'debug',
  auditEnabled: true,
  complianceEnabled: true,
});

export function sendToRenderer(channel: string, data: any): void {
  logger.debug(`Sending to renderer: ${channel}`, { channel, data });
}

export function sendToMain(channel: string, data: any): void {
  logger.debug(`Sending to main: ${channel}`, { channel, data });
}

export class IPCEventBridge {
  static instance: IPCEventBridge;

  static getInstance(): IPCEventBridge {
    if (!IPCEventBridge.instance) {
      IPCEventBridge.instance = new IPCEventBridge();
    }
    return IPCEventBridge.instance;
  }

  sendToRenderer(channel: string, data: any): void {
    sendToRenderer(channel, data);
  }

  sendToMain(channel: string, data: any): void {
    sendToMain(channel, data);
  }
}
