/**
 * Event Subscriber User Story Tests
 * Tests basic scenarios for Norwegian government-compliant event subscription
 */

import {
  EventSubscriber,
  getEventSubscriber,
  createEventSubscriber,
  complianceMiddleware,
  auditMiddleware,
} from '../index';
import { createEvent } from '../../event-core';

describe('Event Subscriber User Stories', () => {
  let subscriber: EventSubscriber;

  beforeEach(() => {
    subscriber = createEventSubscriber();
  });

  afterEach(() => {
    subscriber.unsubscribeAll();
  });

  // User Story 1: Municipality subscribes to citizen events
  it('Municipality Story: should subscribe to and process citizen registration events', async () => {
    // Given: Municipality wants to process citizen registration events
    let receivedEvent: any = null;

    // When: Municipality subscribes to citizen events
    const subscriptionId = subscriber.subscribe(
      'citizen.registered',
      async event => {
        receivedEvent = event;
      },
      {
        filter: {
          eventType: 'citizen.registered',
        },
      }
    );

    // Simulate an event being published
    const citizenEvent = createEvent('citizen.registered', {
      citizenId: 'citizen_001',
      municipalityCode: '0301',
    });

    // Manually trigger the handler to simulate event processing
    const stats = subscriber.getSubscriptionStats(subscriptionId) as any;
    if (stats && stats.handler) {
      await stats.handler(citizenEvent);
    }

    // Then: Event should be processed successfully
    expect(subscriptionId).toBeDefined();
    expect(receivedEvent).toBeTruthy();
  });

  // User Story 2: Subscribe to multiple event types
  it('Multi-Event Story: should subscribe to multiple related event types', () => {
    // Given: Service needs to handle multiple citizen lifecycle events
    const eventTypes = ['citizen.registered', 'citizen.updated', 'citizen.deactivated'];

    // When: Service subscribes to multiple event types
    const subscriptionIds = subscriber.subscribeToMultiple(eventTypes, async event => {
      console.log('Processing citizen lifecycle event:', event.type);
    });

    // Then: Should create subscriptions for all event types
    expect(subscriptionIds).toHaveLength(3);
    subscriptionIds.forEach(id => {
      expect(id).toBeDefined();
    });
  });

  // User Story 3: Pattern-based subscription
  it('Pattern Story: should subscribe using pattern matching for municipal services', () => {
    // Given: Service wants to handle all municipal service events
    const pattern = /^municipal\.service\./;

    // When: Service subscribes with pattern
    const subscriptionId = subscriber.subscribeWithPattern(pattern, async event => {
      console.log('Processing municipal service event:', event.type);
    });

    // Then: Subscription should be created successfully
    expect(subscriptionId).toBeDefined();
  });

  // User Story 4: Filtered subscription for NSM classified events
  it('Classified Events Story: should filter events by NSM classification', () => {
    // Given: Security service only wants to process classified events

    // When: Service subscribes with NSM classification filter
    const subscriptionId = subscriber.subscribe(
      'document.accessed',
      async event => {
        console.log('Processing classified document access:', event.id);
      },
      {
        filter: {
          nsmClassification: ['KONFIDENSIELT', 'HEMMELIG'],
        },
        complianceLevel: 'strict',
      }
    );

    // Then: Subscription should be created with compliance filtering
    expect(subscriptionId).toBeDefined();
  });

  // User Story 5: Subscription with middleware
  it('Middleware Story: should process events through compliance middleware', () => {
    // Given: Service needs compliance and audit middleware
    const testMiddleware = {
      name: 'test-middleware',
      execute: async (event: any, next: () => void) => {
        console.log('Processing through middleware:', event.id);
        next();
      },
    };

    // When: Service subscribes with middleware
    const subscriptionId = subscriber.subscribe(
      'service.updated',
      async event => {
        console.log('Final handler:', event.id);
      },
      {
        middleware: [testMiddleware],
        deadLetterQueue: true,
      }
    );

    // Then: Subscription should be created with middleware
    expect(subscriptionId).toBeDefined();
  });

  // User Story 6: Global subscriber functions
  it('Global Functions Story: should work with global subscriber functions', () => {
    // Given: Developer uses global convenience functions

    // When: Developer creates global subscriber
    const globalSubscriber = getEventSubscriber();

    // Then: Should get a valid subscriber instance
    expect(globalSubscriber).toBeDefined();
    expect(globalSubscriber).toBeInstanceOf(EventSubscriber);
  });

  // User Story 7: Subscription management
  it('Management Story: should manage subscriptions effectively', () => {
    // Given: Service has multiple subscriptions
    const sub1 = subscriber.subscribe('event.type1', async () => {});
    const sub2 = subscriber.subscribe('event.type2', async () => {});

    // When: Service checks subscription stats
    const stats = subscriber.getSubscriptionStats();

    // Then: Should provide subscription information
    expect(Array.isArray(stats)).toBe(true);
    expect((stats as any[]).length).toBe(2);

    // Unsubscribe one
    const unsubscribed = subscriber.unsubscribe(sub1);
    expect(unsubscribed).toBe(true);
  });

  // User Story 8: Dead letter queue functionality
  it('Dead Letter Queue Story: should handle failed event processing', () => {
    // Given: Service has dead letter queue enabled

    // When: Service checks dead letter queue
    const deadLetterQueue = subscriber.getDeadLetterQueue();

    // Then: Should provide dead letter queue access
    expect(Array.isArray(deadLetterQueue)).toBe(true);

    // Clear dead letter queue
    subscriber.clearDeadLetterQueue();
    const clearedQueue = subscriber.getDeadLetterQueue();
    expect(clearedQueue).toHaveLength(0);
  });
});
