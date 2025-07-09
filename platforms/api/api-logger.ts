/**
 * API Logger - Server-side logging for Foundation
 */

export function createApiLogger(config: any): void {
  // Debug: Creating API logger
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('Creating API logger', config);
  }
}

export function logApiEvent(event: any): void {
  // Debug: Logging API event
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('Logging API event', event);
  }
}
