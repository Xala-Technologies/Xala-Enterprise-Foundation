/**
 * Event Core User Story Tests
 * Tests real-world scenarios for Norwegian government-compliant event handling
 */

import { BaseEvent, EventBus, createEventBus, createEvent } from '../index';

describe('Event Core User Stories', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = createEventBus({
      enableCompliance: true,
      maxRetries: 3,
      enableMetrics: true,
    });
  });

  // User Story 1: Citizen registration triggers multiple downstream services
  it('Citizen Registration Story: should broadcast citizen registration event to all relevant services', async () => {
    // Given: Multiple services need to be notified of citizen registration
    const notificationEvents: BaseEvent[] = [];
    const auditEvents: BaseEvent[] = [];
    const emailEvents: BaseEvent[] = [];

    // Subscribe services to citizen registration events
    eventBus.subscribe('citizen.registered', async (event: BaseEvent) => {
      notificationEvents.push(event);
    });

    eventBus.subscribe('citizen.registered', async (event: BaseEvent) => {
      auditEvents.push(event);
    });

    eventBus.subscribe('citizen.registered', async (event: BaseEvent) => {
      emailEvents.push(event);
    });

    // When: Citizen registration event is published
    const citizenData = {
      personnummer: '12345678901',
      firstName: 'Erik',
      lastName: 'Hansen',
      email: 'erik.hansen@example.no',
      municipality: '0301', // Oslo
    };

    const registrationEvent = createEvent('citizen.registered', citizenData, {
      source: 'citizen_service',
      nsmClassification: 'BEGRENSET',
    });

    await eventBus.publish(registrationEvent);

    // Then: All services should receive the event
    expect(notificationEvents).toHaveLength(1);
    expect(auditEvents).toHaveLength(1);
    expect(emailEvents).toHaveLength(1);

    expect(notificationEvents[0].type).toBe('citizen.registered');
    expect(auditEvents[0].type).toBe('citizen.registered');
    expect(emailEvents[0].type).toBe('citizen.registered');
  });

  // User Story 2: Facility booking system handles overbooking scenarios
  it('Facility Booking Story: should handle booking conflicts and notify affected parties', async () => {
    // Given: Booking conflict detection service listens for booking events
    const conflicts: BaseEvent[] = [];
    const notifications: BaseEvent[] = [];

    eventBus.subscribe('booking.conflict', async (event: BaseEvent) => {
      conflicts.push(event);
    });

    eventBus.subscribe('booking.notification', async (event: BaseEvent) => {
      notifications.push(event);
    });

    // When: Booking conflict occurs
    const conflictEvent = createEvent(
      'booking.conflict',
      {
        facilityId: 'facility_001',
        originalBookingId: 'booking_123',
        conflictingBookingId: 'booking_456',
        timeSlot: '2024-03-15T14:00:00Z',
        resolutionRequired: true,
      },
      {
        source: 'booking_service',
        nsmClassification: 'BEGRENSET',
      }
    );

    const notificationEvent = createEvent(
      'booking.notification',
      {
        recipientId: 'user_789',
        message: 'Your booking has been affected by a schedule conflict',
        notificationType: 'booking_conflict',
        priority: 'high',
      },
      {
        source: 'notification_service',
        nsmClassification: 'BEGRENSET',
      }
    );

    await eventBus.publish(conflictEvent);
    await eventBus.publish(notificationEvent);

    // Then: Conflict resolution and notification services should be triggered
    expect(conflicts).toHaveLength(1);
    expect(notifications).toHaveLength(1);

    expect(conflicts[0].type).toBe('booking.conflict');
    expect(notifications[0].type).toBe('booking.notification');
  });

  // User Story 3: Payment processing with compliance logging
  it('Payment Processing Story: should handle payment events with GDPR compliance', async () => {
    // Given: Payment processing requires strict audit logging
    const paymentEvents: BaseEvent[] = [];
    const auditEvents: BaseEvent[] = [];

    eventBus.subscribe('payment.processed', async (event: BaseEvent) => {
      paymentEvents.push(event);
    });

    eventBus.subscribe('payment.audit', async (event: BaseEvent) => {
      auditEvents.push(event);
    });

    // When: Payment is processed
    const paymentData = {
      transactionId: 'txn_12345',
      amount: 150.0,
      currency: 'NOK',
      paymentMethod: 'card',
      merchantId: 'merchant_oslo_001',
      personalDataProcessed: true,
    };

    const paymentEvent = createEvent('payment.processed', paymentData, {
      source: 'payment_service',
      nsmClassification: 'KONFIDENSIELT',
    });

    const auditEvent = createEvent(
      'payment.audit',
      {
        action: 'payment_processed',
        entityType: 'payment',
        entityId: 'txn_12345',
        userId: 'user_123',
        gdprBasis: 'contract',
        personalDataIncluded: true,
      },
      {
        source: 'audit_service',
        nsmClassification: 'KONFIDENSIELT',
      }
    );

    await eventBus.publish(paymentEvent);
    await eventBus.publish(auditEvent);

    // Then: Payment and audit systems should process events appropriately
    expect(paymentEvents).toHaveLength(1);
    expect(auditEvents).toHaveLength(1);

    expect(paymentEvents[0].nsmClassification).toBe('KONFIDENSIELT');
    expect(auditEvents[0].nsmClassification).toBe('KONFIDENSIELT');
  });

  // User Story 4: Multi-service error handling and recovery
  it('Error Handling Story: should gracefully handle service failures and trigger recovery', async () => {
    // Given: System needs to handle cascading failures
    const errorEvents: BaseEvent[] = [];
    const recoveryEvents: BaseEvent[] = [];

    eventBus.subscribe('service.error', async (event: BaseEvent) => {
      errorEvents.push(event);
    });

    eventBus.subscribe('service.recovery', async (event: BaseEvent) => {
      recoveryEvents.push(event);
    });

    // When: Service error occurs
    const errorData = {
      serviceName: 'facility_service',
      errorCode: 'DATABASE_CONNECTION_FAILED',
      errorMessage: 'Unable to connect to database',
      severity: 'critical',
      affectedUsers: 125,
      automaticRecovery: true,
    };

    const errorEvent = createEvent('service.error', errorData, {
      source: 'monitoring_service',
      nsmClassification: 'BEGRENSET',
    });

    const recoveryEvent = createEvent(
      'service.recovery',
      {
        serviceName: 'facility_service',
        recoveryAction: 'failover_to_backup',
        recoveryTime: '2024-03-15T10:05:00Z',
        success: true,
      },
      {
        source: 'recovery_service',
        nsmClassification: 'BEGRENSET',
      }
    );

    await eventBus.publish(errorEvent);
    await eventBus.publish(recoveryEvent);

    // Then: Error handling and recovery should be triggered
    expect(errorEvents).toHaveLength(1);
    expect(recoveryEvents).toHaveLength(1);
  });

  // User Story 5: Real-time event monitoring and analytics
  it('Analytics Story: should provide real-time event analytics for operations team', async () => {
    // Given: Operations team needs event analytics
    const analyticsEvents: BaseEvent[] = [];

    eventBus.subscribe('analytics.event', async (event: BaseEvent) => {
      analyticsEvents.push(event);
    });

    // When: Multiple events occur in the system
    const events = [
      createEvent('user.login', { userId: 'user_001', municipality: '0301' }),
      createEvent('facility.searched', { query: 'swimming pool', results: 5 }),
      createEvent('booking.created', { bookingId: 'booking_123', facilityId: 'facility_001' }),
    ];

    for (const event of events) {
      await eventBus.publish(event);
    }

    // Create analytics event
    const analyticsEvent = createEvent(
      'analytics.event',
      {
        eventType: 'system_activity',
        metrics: {
          totalEvents: 3,
          uniqueUsers: 1,
          popularActions: ['user.login', 'facility.searched', 'booking.created'],
        },
        timeWindow: '1_hour',
      },
      {
        source: 'analytics_service',
        nsmClassification: 'ÅPEN',
      }
    );

    await eventBus.publish(analyticsEvent);

    // Then: Analytics should be available for operations team
    expect(analyticsEvents).toHaveLength(1);
    const stats = eventBus.getStats();
    expect(stats.totalEvents).toBe(4); // 3 + 1 analytics event
    expect(stats.totalSubscriptions).toBe(1);
  });

  // User Story 6: Event subscription management and cleanup
  it('Subscription Management Story: should handle dynamic subscription management', async () => {
    // Given: Dynamic services that subscribe and unsubscribe
    const testEvents: BaseEvent[] = [];
    const errorEvents: BaseEvent[] = [];

    // Subscribe to test events
    const testSubscriptionId = eventBus.subscribe('test.event', async (event: BaseEvent) => {
      testEvents.push(event);
    });

    const errorSubscriptionId = eventBus.subscribe('error.event', async (event: BaseEvent) => {
      errorEvents.push(event);
    });

    // When: Events are published
    await eventBus.publish(createEvent('test.event', { test: true }));
    await eventBus.publish(createEvent('error.event', { error: 'test_error' }));

    // Then: Events should be handled
    expect(testEvents).toHaveLength(1);
    expect(errorEvents).toHaveLength(1);

    // When: Subscriptions are removed
    eventBus.unsubscribe(testSubscriptionId);
    eventBus.unsubscribe(errorSubscriptionId);

    // Then: No more events should be processed
    await eventBus.publish(createEvent('test.event', { test: true }));
    await eventBus.publish(createEvent('error.event', { error: 'test_error' }));

    expect(testEvents).toHaveLength(1); // Still 1
    expect(errorEvents).toHaveLength(1); // Still 1
  });

  // User Story 7: Compliance event batching and retention
  it('Compliance Story: should handle compliance events with proper retention', async () => {
    // Given: Compliance events need special handling
    const complianceEvents: BaseEvent[] = [];

    eventBus.subscribe('compliance.audit', async (event: BaseEvent) => {
      complianceEvents.push(event);
    });

    // When: Multiple compliance events are generated
    const auditEvents = [
      createEvent(
        'compliance.audit',
        {
          action: 'data_access',
          entityType: 'personal_data',
          userId: 'user_123',
          gdprBasis: 'consent',
        },
        {
          source: 'compliance_service',
          nsmClassification: 'KONFIDENSIELT',
        }
      ),
      createEvent(
        'compliance.audit',
        {
          action: 'data_export',
          entityType: 'personal_data',
          userId: 'user_456',
          gdprBasis: 'data_portability',
        },
        {
          source: 'compliance_service',
          nsmClassification: 'KONFIDENSIELT',
        }
      ),
    ];

    for (const event of auditEvents) {
      await eventBus.publish(event);
    }

    // Then: Compliance events should be properly handled
    expect(complianceEvents).toHaveLength(2);

    // Verify compliance metadata is added
    const stats = eventBus.getStats();
    expect(stats.totalEvents).toBe(2);
  });

  // User Story 8: Performance monitoring and metrics collection
  it('Performance Story: should collect performance metrics for system optimization', async () => {
    // Given: Performance monitoring system
    const performanceEvents: BaseEvent[] = [];

    eventBus.subscribe('performance.metric', async (event: BaseEvent) => {
      performanceEvents.push(event);
    });

    // When: Performance metrics are collected
    const performanceEvent = createEvent(
      'performance.metric',
      {
        metric: 'api_response_time',
        value: 145,
        unit: 'ms',
        endpoint: '/api/facilities/search',
        timestamp: new Date(),
      },
      {
        source: 'performance_service',
        nsmClassification: 'ÅPEN',
      }
    );

    const resourceEvent = createEvent(
      'performance.metric',
      {
        metric: 'memory_usage',
        value: 78.5,
        unit: 'percentage',
        service: 'facility_service',
        threshold: 80.0,
        alert: false,
      },
      {
        source: 'resource_monitor',
        nsmClassification: 'ÅPEN',
      }
    );

    await eventBus.publish(performanceEvent);
    await eventBus.publish(resourceEvent);

    // Then: Performance metrics should be available for analysis
    expect(performanceEvents).toHaveLength(2);

    const finalStats = eventBus.getStats();
    expect(finalStats.totalEvents).toBe(2);
    expect(finalStats.eventTypes).toContain('performance.metric');
  });
});
