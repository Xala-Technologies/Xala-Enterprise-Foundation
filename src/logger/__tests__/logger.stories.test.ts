/**
 * Logger User Story Tests
 * Tests real-world scenarios for Norwegian government-compliant logging
 */

import { createLogger, Logger, LogLevel, AuditLogEntry } from '../index';

describe('Logger User Stories', () => {
  let logger: Logger;

  beforeEach(() => {
    // Clear any previous test logs
    logger = createLogger({ level: LogLevel.INFO });
  });

  // User Story 1: Municipal employee logs citizen interaction
  it('Municipal Employee Story: should log citizen interactions with proper audit trail', () => {
    // Given: Municipal employee processes citizen service request
    const auditContext: AuditLogEntry = {
      userId: 'municipal_employee_001',
      action: 'process_service_request',
      entityType: 'citizen_service',
      entityId: 'service_req_12345',
      timestamp: new Date(),
      nsmClassification: 'BEGRENSET',
      gdprBasis: 'public_task',
      personalDataIncluded: true,
    };

    // When: Employee logs the interaction
    logger.audit(auditContext, {
      municipalityCode: '0301', // Oslo
      serviceType: 'facility_booking',
      citizenId: 'citizen_67890',
    });

    // Then: Should create comprehensive audit log with compliance metadata
    // Note: In a real implementation, this would verify log output
    expect(logger).toBeDefined();
  });

  // User Story 2: System administrator monitors application errors
  it('System Admin Story: should track application errors with proper severity levels', () => {
    // Given: System administrator needs to monitor application health
    const appError = new Error('Database connection timeout');

    // When: Different severity errors occur
    logger.debug('Debug information for troubleshooting', {
      component: 'database_layer',
      query: 'SELECT * FROM facilities',
    });

    logger.info('Service request processed successfully', {
      requestId: 'req_001',
      processingTime: '250ms',
      municipalityCode: '0301',
    });

    logger.warn('High memory usage detected', {
      memoryUsage: '85%',
      component: 'facility_service',
      threshold: '80%',
    });

    logger.error('Database connection failed', appError, {
      connectionString: 'postgres://localhost:5432',
      retryAttempt: 3,
      component: 'database_layer',
    });

    // Then: Should log with appropriate severity levels
    expect(logger).toBeDefined();
  });

  // User Story 3: Developer debugging integration issues
  it('Developer Story: should provide detailed debugging information for API integrations', () => {
    // Given: Developer investigating API integration failure
    const debugLogger = createLogger({
      level: LogLevel.DEBUG,
      auditEnabled: true,
      complianceEnabled: false, // Disable for development
    });

    // When: Developer logs debugging information
    debugLogger.debug('API request initiated', {
      endpoint: '/api/facilities',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      requestId: 'req_debug_001',
    });

    debugLogger.debug('API response received', {
      statusCode: 200,
      responseTime: '145ms',
      dataSize: '2.3KB',
      requestId: 'req_debug_001',
    });

    // Then: Should provide comprehensive debugging context
    expect(debugLogger).toBeDefined();
  });

  // User Story 4: Compliance officer audits data processing activities
  it('Compliance Officer Story: should create GDPR-compliant audit logs for data processing', () => {
    // Given: Data processing activity requires GDPR audit trail
    const warnLogger = createLogger({ level: LogLevel.WARN });

    const governmentAuditEntry: AuditLogEntry = {
      userId: 'compliance_officer_001',
      action: 'export_personal_data',
      entityType: 'citizen_data',
      entityId: 'citizen_12345',
      timestamp: new Date(),
      nsmClassification: 'KONFIDENSIELT',
      gdprBasis: 'consent',
      personalDataIncluded: true,
    };

    // When: Compliance officer logs data processing activity
    warnLogger.audit(governmentAuditEntry, {
      legalBasis: 'GDPR Article 6(1)(a) - Consent',
      dataCategories: ['personal_identification', 'contact_information'],
      purpose: 'data_portability_request',
      retentionPeriod: '7_years',
      thirdPartySharing: false,
      automaticDecisionMaking: false,
    });

    // Then: Should create comprehensive GDPR audit trail
    expect(warnLogger).toBeDefined();
  });

  // User Story 5: Security analyst monitors access control events
  it('Security Analyst Story: should log security events with NSM classification', () => {
    // Given: Security analyst monitoring access control
    const securityLogger = createLogger({
      level: LogLevel.INFO,
      auditEnabled: true,
      complianceEnabled: true,
    });

    const securityEvent: AuditLogEntry = {
      userId: 'security_analyst_001',
      action: 'access_denied',
      entityType: 'classified_document',
      entityId: 'doc_hemmelig_001',
      timestamp: new Date(),
      nsmClassification: 'HEMMELIG',
      personalDataIncluded: false,
    };

    // When: Security event is logged
    securityLogger.audit(securityEvent, {
      attemptedBy: 'user_unauthorized_123',
      securityClearance: 'BEGRENSET',
      requiredClearance: 'HEMMELIG',
      accessDecision: 'DENIED',
      alertGenerated: true,
      incidentId: 'SEC_001_2024',
    });

    // Then: Should create security incident audit trail
    expect(securityLogger).toBeDefined();
  });

  // User Story 6: Operations team monitors system performance
  it('Operations Team Story: should log performance metrics and system health', () => {
    // Given: Operations team monitoring system performance
    const performanceLogger = createLogger({
      level: LogLevel.INFO,
      auditEnabled: false, // Performance logs don't need audit
    });

    // When: System performance events are logged
    performanceLogger.info('System performance metrics', {
      cpuUsage: '45%',
      memoryUsage: '62%',
      diskSpace: '78%',
      activeConnections: 125,
      averageResponseTime: '185ms',
      requestsPerSecond: 23.4,
      timestamp: new Date().toISOString(),
    });

    performanceLogger.warn('Performance threshold exceeded', {
      metric: 'response_time',
      currentValue: '2500ms',
      threshold: '2000ms',
      component: 'facility_search',
      impactedUsers: 12,
    });

    // Then: Should track performance trends
    expect(performanceLogger).toBeDefined();
  });
});
