/**
 * Event Publisher Module
 * Advanced event publishing with batching, scheduling, and compliance validation
 */

import { BaseEvent, EventBus, getEventBus } from '../event-core';

export interface PublishOptions {
  delay?: number;
  priority?: 'low' | 'normal' | 'high';
  retries?: number;
  validateCompliance?: boolean;
  batchId?: string;
}

export interface BatchPublishOptions {
  maxBatchSize?: number;
  flushInterval?: number;
  enableCompression?: boolean;
}

export interface ScheduledEvent {
  event: BaseEvent;
  publishAt: Date;
  options?: PublishOptions;
}

export class EventPublisher {
  private eventBus: EventBus;
  private eventQueue: Array<{ event: BaseEvent; options: PublishOptions }> = [];
  private scheduledEvents: ScheduledEvent[] = [];
  private batchBuffer: Map<string, BaseEvent[]> = new Map();
  private flushTimer?: NodeJS.Timeout;
  private scheduledTimeouts: Set<NodeJS.Timeout> = new Set(); // Track scheduled timeouts for cleanup

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || getEventBus();
  }

  /**
   * Initialize the event publisher
   */
  async initialize(): Promise<void> {
    // Initialize any resources if needed
  }

  // Publish single event with options
  async publish<T extends BaseEvent>(event: T, options: PublishOptions = {}): Promise<void> {
    // Validate compliance if requested
    if (options.validateCompliance !== false) {
      this.validateNorwegianCompliance(event);
    }

    // Handle delayed publishing
    if (options.delay && options.delay > 0) {
      const timeoutId = setTimeout(() => {
        this.publishNow(event);
        this.scheduledTimeouts.delete(timeoutId);
      }, options.delay);
      this.scheduledTimeouts.add(timeoutId);
      return;
    }

    // Handle batch publishing
    if (options.batchId) {
      this.addToBatch(options.batchId, event);
      return;
    }

    // Immediate publishing
    await this.publishNow(event);
  }

  // Publish multiple events
  async publishBatch<T extends BaseEvent>(
    events: T[],
    options: PublishOptions = {}
  ): Promise<void> {
    // Sort by priority if specified
    const sortedEvents = this.sortByPriority(events, options.priority);

    // Publish all events
    await Promise.all(sortedEvents.map(event => this.publishNow(event)));
  }

  // Schedule event for future publishing
  scheduleEvent<T extends BaseEvent>(
    event: T,
    publishAt: Date,
    options: PublishOptions = {}
  ): string {
    const scheduledEvent: ScheduledEvent = {
      event,
      publishAt,
      options,
    };

    this.scheduledEvents.push(scheduledEvent);
    this.scheduleEventExecution(scheduledEvent);

    return event.id;
  }

  // Start batch publishing with auto-flush
  startBatch(batchId: string, options: BatchPublishOptions = {}): void {
    const {
      flushInterval = 5000, // 5 seconds
    } = options;

    if (!this.batchBuffer.has(batchId)) {
      this.batchBuffer.set(batchId, []);
    }

    // Set up auto-flush timer
    this.flushTimer = setInterval(() => {
      this.flushBatch(batchId);
    }, flushInterval);
  }

  // Manually flush a batch
  async flushBatch(batchId: string): Promise<void> {
    const events = this.batchBuffer.get(batchId);
    if (!events || events.length === 0) return;

    await Promise.all(events.map(event => this.publishNow(event)));

    this.batchBuffer.set(batchId, []);
  }

  // Stop batch and flush remaining events
  async stopBatch(batchId: string): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    await this.flushBatch(batchId);
    this.batchBuffer.delete(batchId);
  }

  // Validate Norwegian compliance requirements
  private validateNorwegianCompliance(event: BaseEvent): void {
    // Check NSM classification
    if (event.nsmClassification) {
      const validClassifications = ['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'];
      if (!validClassifications.includes(event.nsmClassification)) {
        throw new Error(`Invalid NSM classification: ${event.nsmClassification}`);
      }
    }

    // Check for personal data without GDPR basis
    if (this.containsPersonalData(event) && !event.metadata?.gdprBasis) {
      console.warn('Event contains personal data but no GDPR basis specified:', event.id);
    }

    // Require audit trail for sensitive events
    if (
      event.nsmClassification &&
      ['KONFIDENSIELT', 'HEMMELIG'].includes(event.nsmClassification)
    ) {
      if (!event.metadata?.auditRequired) {
        event.metadata = {
          ...event.metadata,
          auditRequired: true,
        };
      }
    }
  }

  // Check if event contains personal data
  private containsPersonalData(event: BaseEvent): boolean {
    const eventString = JSON.stringify(event);
    const personalDataPatterns = [/email/i, /phone/i, /address/i, /ssn/i, /personnummer/i, /fnr/i];
    return personalDataPatterns.some(pattern => pattern.test(eventString));
  }

  // Add event to batch buffer
  private addToBatch(batchId: string, event: BaseEvent): void {
    if (!this.batchBuffer.has(batchId)) {
      this.batchBuffer.set(batchId, []);
    }
    this.batchBuffer.get(batchId)!.push(event);
  }

  // Sort events by priority
  private sortByPriority<T extends BaseEvent>(
    events: T[],
    priority?: PublishOptions['priority']
  ): T[] {
    if (!priority) return events;

    const priorityOrder = { high: 3, normal: 2, low: 1 };
    return [...events].sort(() => {
      const eventPriority = priorityOrder[priority] || 2;
      return eventPriority;
    });
  }

  // Schedule event execution
  private scheduleEventExecution(scheduledEvent: ScheduledEvent): void {
    const delay = scheduledEvent.publishAt.getTime() - Date.now();

    if (delay <= 0) {
      this.publishNow(scheduledEvent.event);
      return;
    }

    const timeoutId = setTimeout(() => {
      this.publishNow(scheduledEvent.event);
      // Remove from scheduled events
      const index = this.scheduledEvents.indexOf(scheduledEvent);
      if (index > -1) {
        this.scheduledEvents.splice(index, 1);
      }
      // Remove timeout from tracking
      this.scheduledTimeouts.delete(timeoutId);
    }, delay);

    // Unref so it doesn't keep process alive
    if (typeof timeoutId.unref === 'function') {
      timeoutId.unref();
    }

    // Track timeout for cleanup
    this.scheduledTimeouts.add(timeoutId);
  }

  // Publish event immediately
  private async publishNow<T extends BaseEvent>(event: T): Promise<void> {
    await this.eventBus.publish(event);
  }

  // Get publishing statistics
  getStats() {
    return {
      queuedEvents: this.eventQueue.length,
      scheduledEvents: this.scheduledEvents.length,
      activeBatches: this.batchBuffer.size,
      batchSizes: Object.fromEntries(
        Array.from(this.batchBuffer.entries()).map(([id, events]) => [id, events.length])
      ),
    };
  }

  /**
   * Clean up all scheduled timeouts and queues
   * Should be called in tests or when shutting down
   */
  public cleanup(): void {
    // Clear all scheduled timeouts
    for (const timeoutId of this.scheduledTimeouts) {
      clearTimeout(timeoutId);
    }
    this.scheduledTimeouts.clear();

    // Clear all scheduled events
    this.scheduledEvents = [];

    // Clear event queue
    this.eventQueue = [];

    // Clear batch buffer
    this.batchBuffer.clear();

    // Clear flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }
}

// Default publisher instance
let defaultPublisher: EventPublisher;

export const getEventPublisher = (): EventPublisher => {
  if (!defaultPublisher) {
    defaultPublisher = new EventPublisher();
  }
  return defaultPublisher;
};

export const createEventPublisher = (eventBus?: EventBus): EventPublisher => {
  return new EventPublisher(eventBus);
};

// Convenience functions
export const publishEvent = async <T extends BaseEvent>(
  event: T,
  options?: PublishOptions
): Promise<void> => {
  return getEventPublisher().publish(event, options);
};

export const scheduleEvent = <T extends BaseEvent>(
  event: T,
  publishAt: Date,
  options?: PublishOptions
): string => {
  return getEventPublisher().scheduleEvent(event, publishAt, options);
};
