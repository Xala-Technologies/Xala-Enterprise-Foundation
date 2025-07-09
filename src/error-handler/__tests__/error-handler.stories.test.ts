/**
 * Error Handler User Story Tests
 * Tests real-world scenarios for Norwegian government-compliant error handling
 */

import { FoundationErrorHandler, ErrorContext, createErrorHandler } from '../index';

describe('Error Handler User Stories', () => {
  let errorHandler: FoundationErrorHandler;

  beforeEach(() => {
    errorHandler = createErrorHandler({
      enableAuditLogging: true,
      enableComplianceChecks: true,
      maxRetries: 3,
      notificationThreshold: 'high',
    });
  });

  // User Story 1: Citizen encounters booking conflict during facility reservation
  it('Booking Conflict Story: should handle facility booking conflicts with user-friendly messages', async () => {
    // Given: Citizen tries to book a facility that's already reserved
    const bookingError = new Error('Facility is already booked for this time slot');
    (bookingError as any).code = 'BOOKING_CONFLICT';

    const context: ErrorContext = {
      userId: 'citizen_12345',
      requestId: 'req_67890',
      operation: 'facility_booking',
      component: 'booking_service',
      nsmClassification: 'ÅPEN',
    };

    // When: Error is handled by the error handler
    const errorId = await errorHandler.handleError(bookingError, context, 'low');

    // Then: Should provide user-friendly response and log appropriately
    expect(errorId).toBeDefined();
    expect(typeof errorId).toBe('string');

    const reports = errorHandler.getErrorReports();
    expect(reports).toHaveLength(1);
    expect(reports[0].severity).toBe('low');
    expect(reports[0].context.operation).toBe('facility_booking');
  });

  // User Story 2: IT administrator handles critical database connection failure
  it('System Administrator Story: should escalate critical errors and trigger alerts', async () => {
    // Given: Critical database connection failure occurs
    const dbError = new Error('Database connection pool exhausted');
    (dbError as any).code = 'DATABASE_CONNECTION_FAILED';

    const context: ErrorContext = {
      userId: 'admin_001',
      operation: 'database_transaction',
      component: 'data_layer',
      nsmClassification: 'BEGRENSET',
    };

    // When: Critical error is handled
    const errorId = await errorHandler.handleError(dbError, context, 'critical');

    // Then: Should trigger appropriate alerts and create detailed reports
    const reports = errorHandler.getErrorReports();
    const criticalReport = reports.find(r => r.id === errorId);

    expect(criticalReport?.severity).toBe('critical');
    expect(criticalReport?.context.nsmClassification).toBe('BEGRENSET');
  });

  // User Story 3: Developer debugging payment integration issues
  it('Developer Debugging Story: should provide detailed error context for payment issues', async () => {
    // Given: Payment API integration fails with correlation details
    const paymentError = new Error('Payment gateway returned invalid response');
    (paymentError as any).code = 'PAYMENT_API_ERROR';

    const context: ErrorContext = {
      userId: 'dev_001',
      requestId: 'req_payment_123',
      sessionId: 'session_abc789',
      operation: 'process_payment',
      component: 'payment_gateway',
    };

    // When: Developer handles the error with debug information
    const errorId = await errorHandler.handleError(paymentError, context, 'medium');

    // Then: Should provide comprehensive debugging information
    const reports = errorHandler.getErrorReports();
    const paymentReport = reports.find(r => r.id === errorId);

    expect(paymentReport?.context.requestId).toBe('req_payment_123');
    expect(paymentReport?.context.sessionId).toBe('session_abc789');
  });

  // User Story 4: Operations team analyzes error patterns across municipal services
  it('Operations Analytics Story: should track error patterns for municipal service optimization', async () => {
    // Given: Multiple errors occur across different municipal services
    const errors = [
      {
        error: new Error('Service temporarily unavailable'),
        context: { operation: 'facility_search', component: 'search_service' },
        severity: 'medium' as const,
      },
      {
        error: new Error('Validation failed'),
        context: { operation: 'user_registration', component: 'auth_service' },
        severity: 'low' as const,
      },
      {
        error: new Error('Timeout occurred'),
        context: { operation: 'document_upload', component: 'file_service' },
        severity: 'medium' as const,
      },
    ];

    // When: Operations team logs multiple service errors
    for (const { error, context, severity } of errors) {
      (error as any).code = 'FACILITY_UNAVAILABLE';
      await errorHandler.handleError(error, context, severity);
    }

    // Then: Should provide analytics for service optimization
    const stats = errorHandler.getErrorStats();
    expect(stats.total).toBe(3);
    expect(stats.byCategory).toBeDefined();
    expect(stats.bySeverity).toBeDefined();
  });

  // User Story 5: Compliance officer handles personal data processing errors
  it('GDPR Compliance Story: should handle personal data errors with proper compliance logging', async () => {
    // Given: Error occurs during personal data processing
    const gdprError = new Error('Personal data processing validation failed');
    (gdprError as any).code = 'LOW_PRIORITY_WARNING';

    const context: ErrorContext = {
      userId: 'compliance_officer_001',
      operation: 'gdpr_data_export',
      personalDataInvolved: true,
      nsmClassification: 'KONFIDENSIELT',
    };

    // When: Personal data error is handled
    const _errorId = await errorHandler.handlePersonalDataError(
      gdprError,
      context,
      'personal_data_export'
    );

    // Then: Should create comprehensive compliance audit trail
    const reportData = errorHandler.getErrorReports({
      severity: 'high',
    });

    expect(reportData).toHaveLength(1);
    expect(reportData[0].context.personalDataInvolved).toBe(true);
    expect(reportData[0].context.nsmClassification).toBe('KONFIDENSIELT');
  });

  // User Story 6: Security officer handles NSM classified system errors
  it('Security Officer Story: should handle classified errors with appropriate security measures', async () => {
    // Given: Error in classified system component
    const securityError = new Error('Unauthorized access attempt detected');

    const context: ErrorContext = {
      userId: 'security_officer_001',
      operation: 'access_control_validation',
      component: 'security_layer',
      nsmClassification: 'HEMMELIG',
    };

    // When: Security error is handled with high severity
    const errorId = await errorHandler.handleSecurityError(securityError, context, 'critical');

    // Then: Should apply appropriate security incident protocols
    const reports = errorHandler.getErrorReports();
    const securityReport = reports.find(r => r.id === errorId);

    expect(securityReport?.severity).toBe('critical');
    expect(securityReport?.context.nsmClassification).toBe('HEMMELIG');
    expect(securityReport?.context.operation).toBe('security_incident');
  });
});
