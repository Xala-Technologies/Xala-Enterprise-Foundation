/**
 * Event Publisher User Story Tests
 * Tests real-world scenarios for Norwegian government-compliant event publishing
 */

import { createEvent, createEventBus, EventBus } from '../../event-core';
import {
  createEventPublisher,
  EventPublisher,
  getEventPublisher,
  publishEvent,
  scheduleEvent,
} from '../index';

describe('Event Publisher User Stories', () => {
  let eventPublisher: EventPublisher;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = createEventBus();
    eventPublisher = createEventPublisher(eventBus);
  });

  afterEach(() => {
    // Clean up timeouts and resources after each test
    eventPublisher.cleanup();
  });

  // User Story 1: Municipality publishes citizen registration event
  it('Municipality Story: should publish citizen registration event with Norwegian compliance', async () => {
    // Given: Oslo municipality processes new citizen registration
    const citizenEvent = createEvent(
      'citizen.registered',
      {
        citizenId: 'citizen_001',
        municipalityCode: '0301', // Oslo
        registrationDate: new Date(),
      },
      {
        nsmClassification: 'BEGRENSET',
      }
    );

    // When: Municipality publishes the event
    await eventPublisher.publish(citizenEvent, {
      validateCompliance: true,
      priority: 'high',
    });

    // Then: Event should be published successfully (check basic stats)
    const stats = eventPublisher.getStats();
    expect(stats.queuedEvents).toBe(0); // Should be processed immediately
    expect(stats.activeBatches).toBe(0);
  });

  // User Story 2: Batch publishing for high-volume scenarios
  it('Batch Publishing Story: should handle multiple events efficiently for tax season', async () => {
    // Given: Tax office needs to publish many citizen updates during tax season
    const events = [];
    for (let i = 0; i < 10; i++) {
      events.push(
        createEvent('citizen.tax_status_updated', {
          citizenId: `citizen_${i}`,
          taxYear: 2024,
          status: 'processed',
        })
      );
    }

    // When: Tax office publishes events in batch
    await eventPublisher.publishBatch(events, {
      priority: 'normal',
      validateCompliance: true,
    });

    // Then: All events should be processed efficiently
    const stats = eventPublisher.getStats();
    expect(stats.queuedEvents).toBe(0); // All should be processed
    expect(stats.activeBatches).toBe(0);
  });

  // User Story 3: Scheduled event publishing for reminders
  it('Scheduled Publishing Story: should schedule reminder events for municipal services', async () => {
    // Given: Municipal service needs to send reminder notifications
    const reminderEvent = createEvent('service.reminder', {
      serviceType: 'license_renewal',
      citizenId: 'citizen_reminder_001',
      reminderType: 'deadline_approaching',
      daysUntilDeadline: 30,
    });

    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // When: Service schedules reminder event
    const eventId = eventPublisher.scheduleEvent(reminderEvent, futureDate, {
      priority: 'normal',
      validateCompliance: true,
    });

    // Then: Event should be scheduled successfully
    expect(eventId).toBe(reminderEvent.id);
    const stats = eventPublisher.getStats();
    expect(stats.scheduledEvents).toBe(1);
  });

  // User Story 4: Event batching for performance optimization
  it('Performance Story: should use batching for optimal resource utilization', async () => {
    // Given: High-traffic municipal portal needs optimal event handling
    const batchId = 'portal_events_batch';

    // When: Portal starts batching events
    eventPublisher.startBatch(batchId, {
      maxBatchSize: 5,
      flushInterval: 1000,
      enableCompression: true,
    });

    // Add multiple events to batch
    for (let i = 0; i < 3; i++) {
      const event = createEvent('portal.user_action', {
        action: 'page_view',
        userId: `user_${i}`,
        timestamp: new Date(),
      });

      await eventPublisher.publish(event, { batchId });
    }

    // Check that events are batched
    let stats = eventPublisher.getStats();
    expect(stats.activeBatches).toBe(1);
    expect(stats.batchSizes[batchId]).toBe(3);

    // Manually flush the batch
    await eventPublisher.flushBatch(batchId);

    // Then: Events should be processed and batch should be empty
    stats = eventPublisher.getStats();
    expect(stats.batchSizes[batchId]).toBe(0);

    // Clean up
    await eventPublisher.stopBatch(batchId);
  });

  // User Story 5: Compliance validation for classified events
  it('Compliance Story: should validate NSM classification for sensitive events', async () => {
    // Given: Security service handles classified document event
    const classifiedEvent = createEvent(
      'document.classified_accessed',
      {
        documentId: 'doc_hemmelig_001',
        accessedBy: 'security_officer_001',
        clearanceLevel: 'HEMMELIG',
      },
      {
        nsmClassification: 'HEMMELIG',
      }
    );

    // When: Service publishes classified event with validation
    await eventPublisher.publish(classifiedEvent, {
      validateCompliance: true,
      priority: 'high',
    });

    // Then: Event should be published successfully without errors
    const stats = eventPublisher.getStats();
    expect(stats.queuedEvents).toBe(0); // Should be processed immediately
  });

  // User Story 6: Error handling for invalid events
  it('Error Handling Story: should reject events with invalid NSM classification', async () => {
    // Given: Service attempts to publish event with invalid classification
    const invalidEvent = createEvent('invalid.event', {
      data: 'test',
    });
    // Manually set invalid classification for testing
    (invalidEvent as any).nsmClassification = 'INVALID_LEVEL';

    // When: Service attempts to publish invalid event
    // Then: Should throw validation error
    await expect(
      eventPublisher.publish(invalidEvent, { validateCompliance: true })
    ).rejects.toThrow('Invalid NSM classification: INVALID_LEVEL');
  });

  // User Story 7: Global event publisher functions
  it('Global Functions Story: should work with global event publisher functions', async () => {
    // Given: Developer uses global convenience functions
    const serviceEvent = createEvent('service.status_changed', {
      serviceName: 'municipal_portal',
      status: 'online',
      timestamp: new Date(),
    });

    // When: Developer uses global publish function
    await publishEvent(serviceEvent, {
      priority: 'normal',
      validateCompliance: true,
    });

    // Then: Event should be published through global publisher
    const globalPublisher = getEventPublisher();
    const stats = globalPublisher.getStats();
    expect(stats.queuedEvents).toBe(0); // Should be processed immediately
  });

  // User Story 8: Scheduled event for maintenance windows
  it('Maintenance Story: should schedule maintenance notification events', async () => {
    // Given: IT department plans maintenance window
    const maintenanceEvent = createEvent('system.maintenance_scheduled', {
      maintenanceType: 'database_upgrade',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: '4 hours',
      affectedServices: ['citizen_portal', 'tax_system'],
    });

    const notificationTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // When: IT schedules maintenance notification using global function
    const eventId = scheduleEvent(maintenanceEvent, notificationTime, {
      priority: 'high',
      validateCompliance: true,
    });

    // Then: Maintenance event should be scheduled
    expect(eventId).toBe(maintenanceEvent.id);
  });
});
