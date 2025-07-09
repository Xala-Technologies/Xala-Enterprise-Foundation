/**
 * Event Core Module
 * Foundation event system with type safety and Norwegian compliance support
 */

export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  version: string;
  metadata?: Record<string, any>;
  nsmClassification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
}

export interface EventHandler<T extends BaseEvent = BaseEvent> {
  (event: T): Promise<void> | void;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  active: boolean;
}

export interface EventBusOptions {
  enableCompliance?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableMetrics?: boolean;
}

export class EventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: BaseEvent[] = [];
  private options: EventBusOptions;
  private timeouts: Set<NodeJS.Timeout> = new Set(); // Track timeouts for cleanup

  constructor(options: EventBusOptions = {}) {
    this.options = {
      enableCompliance: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableMetrics: true,
      ...options,
    };
  }

  // Subscribe to events
  subscribe<T extends BaseEvent>(eventType: string, handler: EventHandler<T>): string {
    const subscriptionId = this.generateSubscriptionId();
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler: handler as EventHandler,
      active: true,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const eventSubscriptions = this.subscriptions.get(eventType);
    if (eventSubscriptions) {
      eventSubscriptions.push(subscription);
    }
    return subscriptionId;
  }

  // Unsubscribe from events
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of Array.from(this.subscriptions.entries())) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType);
        }
        return true;
      }
    }
    return false;
  }

  // Publish events
  async publish<T extends BaseEvent>(event: T): Promise<void> {
    // Add compliance metadata if enabled
    if (this.options.enableCompliance) {
      this.addComplianceMetadata(event);
    }

    // Store in history
    this.eventHistory.push(event);

    // Get subscribers for this event type
    const subscribers = this.subscriptions.get(event.type) || [];

    // Execute handlers
    await Promise.all(
      subscribers.filter(sub => sub.active).map(sub => this.executeHandler(sub.handler, event))
    );
  }

  // Execute handler with retry logic
  private async executeHandler(handler: EventHandler, event: BaseEvent): Promise<void> {
    let attempts = 0;

    while (attempts <= (this.options.maxRetries ?? 3)) {
      try {
        await handler(event);
        return;
      } catch (error) {
        attempts++;
        if (attempts > (this.options.maxRetries ?? 3)) {
          console.error(`Handler failed after ${this.options.maxRetries} retries:`, error);
          throw error;
        }
        await this.delay(this.options.retryDelay ?? 1000);
      }
    }
  }

  // Add Norwegian compliance metadata
  private addComplianceMetadata(event: BaseEvent): void {
    if (!event.metadata) {
      event.metadata = {};
    }

    event.metadata.compliance = {
      nsmClassification: event.nsmClassification || 'BEGRENSET',
      gdprApplicable: this.containsPersonalData(event),
      auditRequired: true,
      retentionPeriod: 'P7Y', // 7 years
    };
  }

  // Check if event contains personal data
  private containsPersonalData(event: BaseEvent): boolean {
    // Simple check for common personal data fields
    const eventString = JSON.stringify(event);
    const personalDataPatterns = [/email/i, /phone/i, /address/i, /ssn/i, /personnummer/i, /fnr/i];

    return personalDataPatterns.some(pattern => pattern.test(eventString));
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const timeoutId = setTimeout(() => {
        resolve();
        this.timeouts.delete(timeoutId);
      }, ms);
      this.timeouts.add(timeoutId);
    });
  }

  // Get event statistics
  getStats() {
    return {
      totalEvents: this.eventHistory.length,
      totalSubscriptions: Array.from(this.subscriptions.values()).reduce(
        (total, subs) => total + subs.length,
        0
      ),
      eventTypes: Array.from(this.subscriptions.keys()),
      lastEvent: this.eventHistory[this.eventHistory.length - 1],
    };
  }

  // Clear event history (for compliance/privacy)
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Clean up all active timeouts and resources
   * Should be called in tests or when shutting down
   */
  public cleanup(): void {
    // Clear all active timeouts
    for (const timeoutId of this.timeouts) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();

    // Clear all subscriptions
    this.subscriptions.clear();

    // Clear event history
    this.eventHistory = [];
  }
}

// Event factory functions
export const createEvent = <T extends Record<string, any>>(
  type: string,
  data?: T,
  options: {
    source?: string;
    nsmClassification?: BaseEvent['nsmClassification'];
  } = {}
): BaseEvent & T => {
  return {
    id: generateEventId(),
    type,
    timestamp: new Date(),
    source: options.source || 'foundation',
    version: '2.0.0',
    nsmClassification: options.nsmClassification,
    ...data,
  } as BaseEvent & T;
};

export const createComplianceEvent = (
  type: string,
  data: any,
  classification: BaseEvent['nsmClassification'] = 'BEGRENSET'
): BaseEvent => {
  return createEvent(type, data, {
    source: 'compliance-system',
    nsmClassification: classification,
  });
};

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Default event bus instance
let defaultEventBus: EventBus;

export const getEventBus = (): EventBus => {
  if (!defaultEventBus) {
    defaultEventBus = new EventBus();
  }
  return defaultEventBus;
};

export const createEventBus = (options?: EventBusOptions): EventBus => {
  return new EventBus(options);
};
