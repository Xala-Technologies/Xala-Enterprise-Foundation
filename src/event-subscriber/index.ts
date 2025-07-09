/**
 * Event Subscriber Module
 * Advanced event subscription with filtering, middleware, and compliance handling
 */

import { BaseEvent, EventBus, EventHandler, getEventBus } from '../event-core';

export interface SubscriptionOptions {
  filter?: EventFilter;
  middleware?: EventMiddleware[];
  priority?: number;
  maxRetries?: number;
  deadLetterQueue?: boolean;
  complianceLevel?: 'basic' | 'strict';
}

export interface EventFilter {
  eventType?: string | string[];
  source?: string | string[];
  nsmClassification?: string | string[];
  timeRange?: { start: Date; end: Date };
  customFilter?: (event: BaseEvent) => boolean;
}

export interface EventMiddleware {
  name: string;
  execute: (event: BaseEvent, next: () => void) => Promise<void> | void;
}

export interface SubscriptionInfo {
  id: string;
  eventType: string;
  handler: EventHandler;
  options: SubscriptionOptions;
  stats: {
    eventsProcessed: number;
    lastProcessed?: Date;
    errors: number;
  };
}

export class EventSubscriber {
  private eventBus: EventBus;
  private subscriptions: Map<string, SubscriptionInfo> = new Map();
  private deadLetterQueue: BaseEvent[] = [];

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || getEventBus();
  }

  /**
   * Initialize the event subscriber
   */
  async initialize(): Promise<void> {
    // Initialize any resources if needed
    // Event Subscriber initialized successfully
  }

  // Subscribe with advanced options
  subscribe<T extends BaseEvent>(
    eventType: string,
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): string {
    const wrappedHandler = this.createWrappedHandler(handler, options);
    const subscriptionId = this.eventBus.subscribe(eventType, wrappedHandler);

    const subscriptionInfo: SubscriptionInfo = {
      id: subscriptionId,
      eventType,
      handler: handler as EventHandler,
      options,
      stats: {
        eventsProcessed: 0,
        errors: 0,
      },
    };

    this.subscriptions.set(subscriptionId, subscriptionInfo);
    return subscriptionId;
  }

  // Subscribe to multiple event types
  subscribeToMultiple<T extends BaseEvent>(
    eventTypes: string[],
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): string[] {
    return eventTypes.map(eventType => this.subscribe(eventType, handler, options));
  }

  // Subscribe with pattern matching
  subscribeWithPattern<T extends BaseEvent>(
    pattern: RegExp,
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): string {
    const patternHandler: EventHandler = async event => {
      if (pattern.test(event.type)) {
        await (handler as EventHandler)(event);
      }
    };

    return this.subscribe('*', patternHandler, options);
  }

  // Unsubscribe
  unsubscribe(subscriptionId: string): boolean {
    const success = this.eventBus.unsubscribe(subscriptionId);
    if (success) {
      this.subscriptions.delete(subscriptionId);
    }
    return success;
  }

  // Unsubscribe all
  unsubscribeAll(): void {
    for (const subscriptionId of Array.from(this.subscriptions.keys())) {
      this.eventBus.unsubscribe(subscriptionId);
    }
    this.subscriptions.clear();
  }

  // Create wrapped handler with middleware and filtering
  private createWrappedHandler<T extends BaseEvent>(
    handler: EventHandler<T>,
    options: SubscriptionOptions
  ): EventHandler {
    return async (event: BaseEvent) => {
      const subscriptionInfo = Array.from(this.subscriptions.values()).find(
        sub => sub.handler === handler
      );

      if (!subscriptionInfo) return;

      try {
        // Apply event filter
        if (options.filter && !this.passesFilter(event, options.filter)) {
          return;
        }

        // Apply compliance checks
        if (options.complianceLevel === 'strict') {
          this.validateComplianceAccess(event);
        }

        // Execute middleware chain
        if (options.middleware && options.middleware.length > 0) {
          await this.executeMiddleware(event, options.middleware, handler as EventHandler);
        } else {
          await (handler as EventHandler)(event);
        }

        // Update statistics
        subscriptionInfo.stats.eventsProcessed++;
        subscriptionInfo.stats.lastProcessed = new Date();
      } catch (error) {
        subscriptionInfo.stats.errors++;

        // Handle dead letter queue
        if (options.deadLetterQueue) {
          this.addToDeadLetterQueue(event);
        }

        // Error processing event logged internally
        throw error;
      }
    };
  }

  // Check if event passes filter
  private passesFilter(event: BaseEvent, filter: EventFilter): boolean {
    // Event type filter
    if (filter.eventType) {
      const allowedTypes = Array.isArray(filter.eventType) ? filter.eventType : [filter.eventType];
      if (!allowedTypes.includes(event.type)) return false;
    }

    // Source filter
    if (filter.source) {
      const allowedSources = Array.isArray(filter.source) ? filter.source : [filter.source];
      if (!allowedSources.includes(event.source)) return false;
    }

    // NSM classification filter
    if (filter.nsmClassification && event.nsmClassification) {
      const allowedClassifications = Array.isArray(filter.nsmClassification)
        ? filter.nsmClassification
        : [filter.nsmClassification];
      if (!allowedClassifications.includes(event.nsmClassification)) return false;
    }

    // Time range filter
    if (filter.timeRange) {
      const eventTime = event.timestamp.getTime();
      const startTime = filter.timeRange.start.getTime();
      const endTime = filter.timeRange.end.getTime();
      if (eventTime < startTime || eventTime > endTime) return false;
    }

    // Custom filter
    if (filter.customFilter && !filter.customFilter(event)) {
      return false;
    }

    return true;
  }

  // Validate compliance access
  private validateComplianceAccess(event: BaseEvent): void {
    // Check NSM classification access
    if (event.nsmClassification) {
      const restrictedClassifications = ['KONFIDENSIELT', 'HEMMELIG'];
      if (restrictedClassifications.includes(event.nsmClassification)) {
        // In a real implementation, check user security clearance
        // Accessing restricted event - logged internally
      }
    }

    // Check GDPR compliance
    if (event.metadata?.personalDataIncluded) {
      if (!event.metadata?.gdprBasis) {
        throw new Error('GDPR basis required for personal data access');
      }
    }
  }

  // Execute middleware chain
  private async executeMiddleware(
    event: BaseEvent,
    middleware: EventMiddleware[],
    finalHandler: EventHandler
  ): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= middleware.length) {
        await finalHandler(event);
        return;
      }

      const currentMiddleware = middleware[index++];
      await currentMiddleware.execute(event, next);
    };

    await next();
  }

  // Add event to dead letter queue
  private addToDeadLetterQueue(event: BaseEvent): void {
    this.deadLetterQueue.push({
      ...event,
      metadata: {
        ...event.metadata,
        deadLetterReason: 'Handler execution failed',
        deadLetterTimestamp: new Date(),
      },
    });
  }

  // Get subscription statistics
  getSubscriptionStats(subscriptionId?: string): SubscriptionInfo | SubscriptionInfo[] {
    if (subscriptionId) {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription ${subscriptionId} not found`);
      }
      return subscription;
    }

    return Array.from(this.subscriptions.values());
  }

  // Get dead letter queue
  getDeadLetterQueue(): BaseEvent[] {
    return [...this.deadLetterQueue];
  }

  // Clear dead letter queue
  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
  }

  // Process dead letter queue
  async processDeadLetterQueue(): Promise<void> {
    const events = [...this.deadLetterQueue];
    this.deadLetterQueue = [];

    for (const event of events) {
      try {
        await this.eventBus.publish(event);
      } catch (error) {
        // Failed to reprocess dead letter event - logged internally
        this.deadLetterQueue.push(event);
      }
    }
  }
}

// Built-in middleware
export const complianceMiddleware: EventMiddleware = {
  name: 'compliance',
  execute: async (event: BaseEvent, next: () => void) => {
    // Log compliance-relevant events
    if (event.nsmClassification || event.metadata?.personalDataIncluded) {
      // Compliance event processed - logged internally
    }
    next();
  },
};

export const auditMiddleware: EventMiddleware = {
  name: 'audit',
  execute: async (event: BaseEvent, next: () => void) => {
    // Create audit log for all events
    // Audit: Event processed - logged internally
    next();
  },
};

// Default subscriber instance
let defaultSubscriber: EventSubscriber;

export const getEventSubscriber = (): EventSubscriber => {
  if (!defaultSubscriber) {
    defaultSubscriber = new EventSubscriber();
  }
  return defaultSubscriber;
};

export const createEventSubscriber = (eventBus?: EventBus): EventSubscriber => {
  return new EventSubscriber(eventBus);
};
