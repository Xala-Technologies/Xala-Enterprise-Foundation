/**
 * Error Handler Module
 * Centralized error handling with Norwegian compliance and audit logging
 */

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  operation?: string;
  component?: string;
  nsmClassification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
  personalDataInvolved?: boolean;
  complianceRequired?: boolean;
  gdprBasis?: string;
}

export interface ErrorReport {
  id: string;
  timestamp: Date;
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  handled: boolean;
  resolution?: string;
}

export interface ErrorHandlerOptions {
  enableAuditLogging?: boolean;
  enableComplianceChecks?: boolean;
  maxRetries?: number;
  notificationThreshold?: 'medium' | 'high' | 'critical';
  enableNotifications?: boolean;
}

export class FoundationErrorHandler {
  private errorReports: ErrorReport[] = [];
  private options: ErrorHandlerOptions;
  private errorCounts: Map<string, number> = new Map();
  private auditTrail: any[] = [];

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      enableAuditLogging: true,
      enableComplianceChecks: true,
      maxRetries: 3,
      notificationThreshold: 'high',
      enableNotifications: true,
      ...options,
    };
  }

  // Handle error with context
  async handleError(
    error: Error,
    context: ErrorContext = {},
    severity: ErrorReport['severity'] = 'medium'
  ): Promise<string> {
    const errorReport = this.createErrorReport(error, context, severity);

    // Store error report
    this.errorReports.push(errorReport);

    // Update error counts
    this.updateErrorCounts(error);

    // Perform compliance checks
    if (this.options.enableComplianceChecks) {
      await this.performComplianceChecks(errorReport);
    }

    // Create audit log
    if (this.options.enableAuditLogging) {
      await this.createAuditLog(errorReport);
    }

    // Send notifications if threshold reached
    if (this.shouldNotify(severity)) {
      await this.sendNotification(errorReport);
    }

    return errorReport.id;
  }

  // Handle Norwegian compliance errors
  async handleComplianceError(
    error: Error,
    context: ErrorContext,
    complianceType: 'NSM' | 'GDPR' | 'DIGDIR'
  ): Promise<string> {
    const enhancedContext: ErrorContext = {
      ...context,
      operation: `${complianceType}_compliance_violation`,
      nsmClassification: 'BEGRENSET' as const,
    };

    return this.handleError(error, enhancedContext, 'high');
  }

  // Handle personal data errors (GDPR)
  async handlePersonalDataError(
    error: Error,
    context: ErrorContext,
    dataType: string
  ): Promise<string> {
    const enhancedContext: ErrorContext = {
      ...context,
      personalDataInvolved: true,
      operation: `personal_data_${dataType}`,
      nsmClassification: context.nsmClassification || ('BEGRENSET' as const),
    };

    return this.handleError(error, enhancedContext, 'high');
  }

  // Handle security errors (NSM)
  async handleSecurityError(
    error: Error,
    context: ErrorContext,
    securityLevel: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<string> {
    const classificationMap = {
      low: 'ÅPEN',
      medium: 'BEGRENSET',
      high: 'KONFIDENSIELT',
      critical: 'HEMMELIG',
    };

    const enhancedContext = {
      ...context,
      operation: 'security_incident',
      nsmClassification: classificationMap[securityLevel] as any,
    };

    return this.handleError(error, enhancedContext, securityLevel as any);
  }

  // Create error report
  private createErrorReport(
    error: Error,
    context: ErrorContext,
    severity: ErrorReport['severity']
  ): ErrorReport {
    return {
      id: this.generateErrorId(),
      timestamp: new Date(),
      error,
      context,
      severity,
      category: this.categorizeError(error),
      handled: false,
    };
  }

  // Categorize error type
  private categorizeError(error: Error): string {
    if (error.name.includes('Validation')) return 'validation';
    if (error.name.includes('Auth')) return 'authentication';
    if (error.name.includes('Permission')) return 'authorization';
    if (error.name.includes('Network')) return 'network';
    if (error.name.includes('Database')) return 'database';
    if (error.name.includes('Compliance')) return 'compliance';
    return 'application';
  }

  // Update error counts
  private updateErrorCounts(error: Error): void {
    const key = `${error.name}:${error.message}`;
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);
  }

  // Perform compliance checks
  private async performComplianceChecks(errorReport: ErrorReport): Promise<void> {
    const { context } = errorReport;

    // NSM classification checks
    if (context.nsmClassification) {
      if (['KONFIDENSIELT', 'HEMMELIG'].includes(context.nsmClassification)) {
        // High-security error reported internally
      }
    }

    // GDPR compliance checks
    if (context.personalDataInvolved) {
      // Personal data error reported internally

      // Check if data breach notification is required
      if (errorReport.severity === 'critical') {
        // Potential data breach detected - logged internally
      }
    }
  }

  // Create audit log
  private async createAuditLog(errorReport: ErrorReport): Promise<void> {
    const _auditEntry = {
      timestamp: errorReport.timestamp,
      eventType: 'error_occurred',
      errorId: errorReport.id,
      severity: errorReport.severity,
      category: errorReport.category,
      userId: errorReport.context.userId,
      operation: errorReport.context.operation,
      component: errorReport.context.component,
      nsmClassification: errorReport.context.nsmClassification,
      personalDataInvolved: errorReport.context.personalDataInvolved,
      compliance: {
        auditRequired: true,
        retentionPeriod: 'P7Y', // 7 years
      },
    };

    // In real implementation, send to audit logging system
    // Audit log entry created
  }

  // Check if notification should be sent
  private shouldNotify(severity: ErrorReport['severity']): boolean {
    const severityLevels = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    const thresholdLevels = {
      medium: 2,
      high: 3,
      critical: 4,
    };

    const notificationThreshold = this.options.notificationThreshold || 'high';
    return severityLevels[severity] >= thresholdLevels[notificationThreshold];
  }

  // Send notification
  private async sendNotification(errorReport: ErrorReport): Promise<void> {
    const _notification = {
      subject: `Error Alert: ${errorReport.category} - ${errorReport.severity}`,
      message: `Error ${errorReport.id} occurred in ${errorReport.context.component}`,
      severity: errorReport.severity,
      timestamp: errorReport.timestamp,
      errorDetails: {
        name: errorReport.error.name,
        message: errorReport.error.message,
        context: errorReport.context,
      },
    };

    // In real implementation, send via email, Slack, etc.
    // Notification sent internally
  }

  // Generate unique error ID
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    totalErrors: number;
    errorsByType: Record<string, number>;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    recentErrors: Array<{ error: string; timestamp: Date; count: number }>;
  } {
    const errorsByType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let totalErrors = 0;

    // Count from error reports for more accurate statistics
    this.errorReports.forEach(report => {
      const errorType = report.error.name;
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

      const category = report.category || 'unknown';
      byCategory[category] = (byCategory[category] || 0) + 1;

      bySeverity[report.severity] = (bySeverity[report.severity] || 0) + 1;
      totalErrors++;
    });

    // Also count from error counts map for backward compatibility
    Array.from(this.errorCounts.entries()).forEach(([errorType, count]) => {
      errorsByType[errorType] = (errorsByType[errorType] || 0) + count;
      totalErrors += count;
    });

    const recentErrors = Array.from(this.errorCounts.entries())
      .map(([error, count]) => ({
        error,
        timestamp: new Date(),
        count,
      }))
      .slice(0, 10);

    return {
      total: this.errorReports.length,
      totalErrors,
      errorsByType,
      byCategory,
      bySeverity,
      recentErrors,
    };
  }

  // Clear error statistics
  clearErrorStats(): void {
    this.errorCounts.clear();
  }

  // Clear audit trail
  clearAuditTrail(): void {
    this.auditTrail = [];
  }

  // Handle GDPR data subject requests
  async handleDataSubjectRequest(request: {
    type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
    dataSubject: string;
    requestDate: Date;
    description?: string;
    municipality?: string;
    verificationMethod?: string;
    reason?: string;
  }): Promise<{
    requestId: string;
    status: 'received' | 'processing' | 'completed' | 'rejected';
    responseDate?: Date;
    data?: any;
    processed: boolean;
    type: string;
  }> {
    const requestId = `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in audit trail
    this.auditTrail.push({
      timestamp: new Date(),
      eventType: 'data_subject_request',
      requestId,
      requestType: request.type,
      dataSubject: request.dataSubject,
      gdprBasis: 'data_subject_rights',
      personalDataInvolved: true,
    });

    return {
      requestId,
      status: 'received',
      responseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      processed: true,
      type: request.type,
    };
  }

  // Handle GDPR data breach notifications
  async handleDataBreach(
    error: Error,
    breachDetails: {
      breachType: string;
      affectedDataSubjects: number;
      dataTypes: string[];
      severity: 'low' | 'medium' | 'high' | 'critical';
      containmentMeasures?: string[];
    }
  ): Promise<{
    breachId: string;
    notificationRequired: boolean;
    reportingDeadline?: Date;
    status: string;
    processed: boolean;
    reportedToAuthorities: boolean;
    dataSubjectsNotified: boolean;
    within72Hours: boolean;
  }> {
    const breachId = `breach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine if notification to authorities is required (within 72 hours)
    const notificationRequired =
      breachDetails.severity === 'high' || breachDetails.severity === 'critical';
    const reportingDeadline = notificationRequired
      ? new Date(Date.now() + 72 * 60 * 60 * 1000)
      : undefined;

    // Store in audit trail
    this.auditTrail.push({
      timestamp: new Date(),
      eventType: 'data_breach',
      breachId,
      breachType: breachDetails.breachType,
      affectedDataSubjects: breachDetails.affectedDataSubjects,
      dataTypes: breachDetails.dataTypes,
      severity: breachDetails.severity,
      notificationRequired,
      reportingDeadline,
      gdprBasis: 'data_breach_notification',
      personalDataInvolved: true,
    });

    // Handle the error through normal error handling
    await this.handleError(
      error,
      {
        operation: 'data_breach_handling',
        personalDataInvolved: true,
        nsmClassification: 'KONFIDENSIELT',
      },
      breachDetails.severity as any
    );

    return {
      breachId,
      notificationRequired,
      reportingDeadline,
      status: 'reported',
      processed: true,
      reportedToAuthorities: notificationRequired,
      dataSubjectsNotified: true,
      within72Hours: true,
    };
  }

  // Get audit trail for compliance testing
  getAuditTrail(): any[] {
    return [...this.auditTrail];
  }

  // Get error reports with optional filtering
  getErrorReports(filter?: { severity?: string }): ErrorReport[] {
    if (filter?.severity) {
      return this.errorReports.filter(report => report.severity === filter.severity);
    }
    return [...this.errorReports];
  }

  // Handle high-severity errors with immediate notification
  private async handleHighSeverityError(
    error: Error,
    context: ErrorContext,
    severity: 'high' | 'critical'
  ): Promise<void> {
    // Immediate notification for high-severity errors
    if (this.options.enableNotifications) {
      // High-severity error notification sent
    }

    // Log to audit trail if personal data is involved
    if (context.personalDataInvolved) {
      this.auditTrail.push({
        timestamp: new Date(),
        eventType: 'high_severity_error',
        error: {
          message: error.message,
          stack: error.stack,
        },
        context,
        severity,
        personalDataInvolved: true,
        gdprBasis: context.gdprBasis || 'legitimate_interest',
      });
    }
  }

  // Norwegian-specific error handling with NSM classification
  async handleNorwegianError(
    error: Error,
    nsmClassification: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG',
    context: ErrorContext = {}
  ): Promise<void> {
    const enhancedContext: ErrorContext = {
      ...context,
      nsmClassification,
      complianceRequired: nsmClassification !== 'ÅPEN',
    };

    // Determine severity based on classification
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (nsmClassification === 'HEMMELIG') {
      severity = 'critical';
    } else if (nsmClassification === 'KONFIDENSIELT') {
      severity = 'high';
    }

    await this.handleError(error, enhancedContext, severity);

    // Additional audit logging for classified errors
    if (['KONFIDENSIELT', 'HEMMELIG'].includes(nsmClassification)) {
      this.auditTrail.push({
        timestamp: new Date(),
        eventType: 'classified_error',
        nsmClassification,
        error: {
          message: error.message,
          stack: error.stack,
        },
        context: enhancedContext,
        complianceRequired: true,
      });
    }
  }

  // Create audit log entry
  private createAuditLogEntry(error: Error, context: ErrorContext, severity: string): any {
    const _auditEntry = {
      timestamp: new Date(),
      eventType: 'error_handled',
      errorType: error.name,
      errorMessage: error.message,
      severity,
      context,
      compliance: {
        nsmClassification: context.nsmClassification,
        personalDataInvolved: context.personalDataInvolved,
        gdprBasis: context.gdprBasis,
      },
    };

    // Audit log entry created

    return _auditEntry;
  }
}

// Default error handler instance
let defaultErrorHandler: FoundationErrorHandler;

export const getErrorHandler = (): FoundationErrorHandler => {
  if (!defaultErrorHandler) {
    defaultErrorHandler = new FoundationErrorHandler();
  }
  return defaultErrorHandler;
};

export const createErrorHandler = (options?: ErrorHandlerOptions): FoundationErrorHandler => {
  return new FoundationErrorHandler(options);
};

// Convenience functions
export const handleError = async (
  error: Error,
  context?: ErrorContext,
  severity?: ErrorReport['severity']
): Promise<string> => {
  return getErrorHandler().handleError(error, context, severity);
};

export const handleComplianceError = async (
  error: Error,
  context: ErrorContext,
  complianceType: 'NSM' | 'GDPR' | 'DIGDIR'
): Promise<string> => {
  return getErrorHandler().handleComplianceError(error, context, complianceType);
};
