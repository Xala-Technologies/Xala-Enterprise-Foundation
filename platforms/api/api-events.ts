/**
 * API Events - Server-side event handling for Foundation
 */

export function publishEvent(eventName: string, data: any): void {
  // Debug: Publishing API event
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`Publishing API event: ${eventName}`, data);
  }
}

export function subscribeToEvent(eventName: string, _handler: (data: any) => void): void {
  // Debug: Subscribing to API event
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`Subscribing to API event: ${eventName}`);
  }
}
