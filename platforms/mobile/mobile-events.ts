/**
 * Mobile Events - React Native event handling
 */

export function publishEvent(eventName: string, data: any): void {
  console.log(`Publishing mobile event: ${eventName}`, data);
}

export function subscribeToEvent(eventName: string, _handler: (data: any) => void): void {
  console.log(`Subscribing to mobile event: ${eventName}`);
}
