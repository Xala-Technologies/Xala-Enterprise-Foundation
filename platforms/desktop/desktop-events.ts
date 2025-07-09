/**
 * Desktop Events - Electron-specific event handling
 */

export function publishEvent(eventName: string, data: any): void {
  // eslint-disable-next-line no-console
  console.log(`Publishing desktop event: ${eventName}`, data);
}

export function subscribeToEvent(eventName: string, _handler: (data: any) => void): void {
  // eslint-disable-next-line no-console
  console.log(`Subscribing to desktop event: ${eventName}`);
}
