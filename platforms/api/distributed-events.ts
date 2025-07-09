/**
 * Distributed Events - Multi-service event handling
 */

export function publishDistributedEvent(eventName: string, data: any): void {
  // eslint-disable-next-line no-console
  console.log(`Publishing distributed event: ${eventName}`, data);
}

export function subscribeToDistributedEvent(
  eventName: string,
  _handler: (data: any) => void
): void {
  // eslint-disable-next-line no-console
  console.log(`Subscribing to distributed event: ${eventName}`);
}

export class DistributedEventBus {
  static instance: DistributedEventBus;

  static getInstance(): DistributedEventBus {
    if (!DistributedEventBus.instance) {
      DistributedEventBus.instance = new DistributedEventBus();
    }
    return DistributedEventBus.instance;
  }

  publish(eventName: string, data: any): void {
    publishDistributedEvent(eventName, data);
  }

  subscribe(eventName: string, handler: (data: any) => void): void {
    subscribeToDistributedEvent(eventName, handler);
  }
}
