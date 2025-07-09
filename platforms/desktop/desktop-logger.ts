/**
 * Desktop Logger
 */

export class DesktopLogger {
  info(message: string, data?: any): void {
    // eslint-disable-next-line no-console
    console.log('Desktop info:', message, data);
  }

  error(message: string, data?: any): void {
    // eslint-disable-next-line no-console
    console.error('Desktop error:', message, data);
  }
}

/**
 * Desktop Logger - Electron-specific logging
 */

export function createDesktopLogger(config: any): void {
  // eslint-disable-next-line no-console
  console.log('Creating desktop logger', config);
}

export function logDesktopEvent(event: any): void {
  // eslint-disable-next-line no-console
  console.log('Logging desktop event', event);
}
