/**
 * NSM Security Classification Snippets
 *
 * Reusable code snippets for implementing NSM (Norwegian Security Authority)
 * security classifications in your applications.
 */

import { createNSMClassifiedLog, FeatureToggle } from '../../src';

// NSM Classification Levels
export const NSM_CLASSIFICATIONS = {
  OPEN: 'ÅPEN',
  RESTRICTED: 'BEGRENSET',
  CONFIDENTIAL: 'KONFIDENSIELT',
  SECRET: 'HEMMELIG',
} as const;

// Snippet 1: Basic NSM Logging
export function logWithNSMClassification(
  classification: keyof typeof NSM_CLASSIFICATIONS,
  message: string,
  data?: Record<string, unknown>
) {
  createNSMClassifiedLog(NSM_CLASSIFICATIONS[classification], message, {
    ...data,
    timestamp: new Date().toISOString(),
    source: 'municipal_application',
  });
}

// Example usage:
// logWithNSMClassification('RESTRICTED', 'Citizen profile accessed', { userId: 'emp001' });

// Snippet 2: Feature Toggle with NSM Security Clearance
export function createSecureFeatureToggle(
  featureKey: string,
  requiredClassification: keyof typeof NSM_CLASSIFICATIONS,
  description: string
) {
  const featureToggle = new FeatureToggle();

  featureToggle.register({
    key: featureKey,
    enabled: true,
    nsmClassification: NSM_CLASSIFICATIONS[requiredClassification],
    description,
  });

  return {
    isAuthorized: (userAttributes: { securityClearance?: string }) => {
      return featureToggle.isEnabled(featureKey, {
        userId: 'system',
        attributes: userAttributes,
      });
    },
    getClassification: () => NSM_CLASSIFICATIONS[requiredClassification],
  };
}

// Example usage:
// const sensitiveFeature = createSecureFeatureToggle(
//   'access_tax_records',
//   'CONFIDENTIAL',
//   'Access to citizen tax information'
// );

// Snippet 3: NSM Event Publishing
export async function publishNSMEvent(
  eventType: string,
  data: Record<string, unknown>,
  classification: keyof typeof NSM_CLASSIFICATIONS
) {
  const publisher = new EventPublisher();

  await publisher.publish({
    type: eventType,
    data,
    metadata: {
      nsmClassification: NSM_CLASSIFICATIONS[classification],
      timestamp: new Date().toISOString(),
      auditRequired: classification !== 'OPEN',
    },
    nsmClassification: NSM_CLASSIFICATIONS[classification],
  });
}

// Example usage:
// await publishNSMEvent('citizen.data.accessed', { profileId: '123' }, 'RESTRICTED');

// Snippet 4: NSM Classification Validator
export function validateNSMAccess(
  requiredLevel: keyof typeof NSM_CLASSIFICATIONS,
  userClearance: string
): boolean {
  const classificationHierarchy = ['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'];

  const requiredIndex = classificationHierarchy.indexOf(NSM_CLASSIFICATIONS[requiredLevel]);
  const userIndex = classificationHierarchy.indexOf(userClearance);

  return userIndex >= requiredIndex;
}

// Example usage:
// const hasAccess = validateNSMAccess('RESTRICTED', userClearanceLevel);

// Snippet 5: NSM Audit Trail
export function createNSMAuditTrail(
  operation: string,
  resourceType: string,
  classification: keyof typeof NSM_CLASSIFICATIONS,
  userId: string,
  additionalData?: Record<string, unknown>
) {
  const auditData = {
    operation,
    resourceType,
    userId,
    classification: NSM_CLASSIFICATIONS[classification],
    timestamp: new Date().toISOString(),
    sessionId: generateSessionId(),
    ...additionalData,
  };

  createNSMClassifiedLog(
    NSM_CLASSIFICATIONS[classification],
    `NSM Audit: ${operation} on ${resourceType}`,
    auditData
  );

  return auditData;
}

// Helper function for session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Example usage:
// createNSMAuditTrail('read', 'citizen_profile', 'RESTRICTED', 'emp001', {
//   profileId: 'citizen123',
//   department: 'social_services'
// });

// Snippet 6: NSM Middleware for Express.js
export function createNSMMiddleware(requiredClassification: keyof typeof NSM_CLASSIFICATIONS) {
  return (req: any, res: any, next: any) => {
    const userClearance = req.user?.securityClearance;

    if (!userClearance) {
      res.status(401).json({ error: 'Security clearance required' });
      return;
    }

    if (!validateNSMAccess(requiredClassification, userClearance)) {
      logWithNSMClassification('RESTRICTED', 'Unauthorized NSM access attempt', {
        userId: req.user?.id,
        requiredLevel: NSM_CLASSIFICATIONS[requiredClassification],
        userLevel: userClearance,
        endpoint: req.path,
      });

      res.status(403).json({ error: 'Insufficient security clearance' });
      return;
    }

    // Log authorized access
    createNSMAuditTrail('api_access', 'endpoint', requiredClassification, req.user.id, {
      endpoint: req.path,
      method: req.method,
    });

    next();
  };
}

// Example usage in Express route:
// app.get('/api/sensitive-data', createNSMMiddleware('CONFIDENTIAL'), (req, res) => {
//   // Handle sensitive data request
// });

// Export all NSM utilities
export const NSMUtils = {
  log: logWithNSMClassification,
  createFeatureToggle: createSecureFeatureToggle,
  publishEvent: publishNSMEvent,
  validateAccess: validateNSMAccess,
  createAuditTrail: createNSMAuditTrail,
  middleware: createNSMMiddleware,
  classifications: NSM_CLASSIFICATIONS,
};
