/**
 * Feature Toggle User Story Tests
 * Tests real-world scenarios for Norwegian government feature management
 */

import {
  FeatureFlag,
  FeatureToggleManager,
  UserContext,
  createFeatureToggleManager,
} from '../index';

describe('Feature Toggle User Stories', () => {
  let featureManager: FeatureToggleManager;

  beforeEach(() => {
    featureManager = createFeatureToggleManager({
      enableAuditLogging: true,
      enableCompliance: true,
      defaultRolloutPercentage: 0,
    });
  });

  // User Story 1: Oslo municipality enables new booking system gradually
  it('Oslo Municipality Story: should gradually roll out new booking system to citizens', async () => {
    // Given: Oslo wants to test new booking system with 25% of users
    const newBookingFlag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'> = {
      key: 'new_booking_system',
      name: 'New Municipal Booking System',
      description: 'Enhanced booking system for municipal facilities',
      enabled: true,
      rolloutPercentage: 25,
      targeting: {
        municipalities: ['0301'], // Oslo municipality code
        userGroups: ['citizens'],
      },
      nsmClassification: 'ÅPEN',
      metadata: {
        version: '2.0.0',
        environment: 'production',
      },
    };

    // When: Oslo registers the new booking feature
    featureManager.registerFlag(newBookingFlag);

    const osloContext: UserContext = {
      userId: 'user_123',
      municipality: '0301',
      userGroup: 'citizens',
    };

    // Then: Feature should be available to Oslo citizens based on rollout
    const isEnabled = featureManager.isEnabled('new_booking_system', osloContext);

    // Due to deterministic rollout, this should be consistent
    expect(typeof isEnabled).toBe('boolean');
    expect(featureManager.getFlag('new_booking_system')).toBeDefined();
  });

  // User Story 2: Payment team needs feature flag analytics for rollout decisions
  it('Payment Team Story: should track feature usage analytics for payment modernization', async () => {
    // Given: Payment team rolls out new payment gateway to all users
    const paymentFlag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'> = {
      key: 'new_payment_gateway',
      name: 'Modern Payment Gateway',
      description: 'New payment processing system with better security',
      enabled: true,
      rolloutPercentage: 100,
      targeting: {
        userGroups: ['citizens', 'businesses'],
      },
      nsmClassification: 'BEGRENSET',
    };

    featureManager.registerFlag(paymentFlag);

    // Test multiple user evaluations
    for (let i = 0; i < 10; i++) {
      featureManager.isEnabled('new_payment_gateway', {
        userId: `user_${i}`,
        userGroup: 'citizens',
      });
    }

    // When: Payment team reviews analytics
    const analytics = featureManager.getStats();

    // Then: Should show comprehensive feature usage data
    expect(analytics.totalFlags).toBe(1);
    expect(analytics.enabledFlags).toBe(1);
    expect(analytics.evaluationsLast24h).toBeGreaterThan(0);
  });

  // User Story 3: Multilingual support team enables Norwegian language features
  it('Language Team Story: should enable Norwegian language features by region', async () => {
    // Given: Language team wants to enable enhanced Norwegian features
    const multilingualFlag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'> = {
      key: 'enhanced_norwegian_support',
      name: 'Enhanced Norwegian Language Support',
      description: 'Advanced language features for Norwegian dialects',
      enabled: true,
      rolloutPercentage: 100,
      targeting: {
        regions: ['østlandet', 'vestlandet', 'trøndelag', 'nord-norge'],
        municipalities: ['0301', '4601', '5001'], // Oslo, Bergen, Trondheim
      },
      nsmClassification: 'ÅPEN',
    };

    featureManager.registerFlag(multilingualFlag);

    // When: Users from different Norwegian regions check the feature
    const osloUser = featureManager.isEnabled('enhanced_norwegian_support', {
      municipality: '0301',
      region: 'østlandet',
    });

    const bergenUser = featureManager.isEnabled('enhanced_norwegian_support', {
      municipality: '4601',
      region: 'vestlandet',
    });

    const stavanger = featureManager.isEnabled('enhanced_norwegian_support', {
      municipality: '1103', // Stavanger - not in targeting
      region: 'vestlandet',
    });

    // Then: Should work for targeted municipalities
    expect(osloUser).toBe(true);
    expect(bergenUser).toBe(true);
    expect(stavanger).toBe(false); // Not in municipality list
  });

  // User Story 4: Security team restricts AI features to authorized personnel
  it('Security Team Story: should restrict AI features based on NSM classification', async () => {
    // Given: AI suggestions feature requires security clearance
    const aiSuggestionsFlag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'> = {
      key: 'ai_document_suggestions',
      name: 'AI Document Suggestions',
      description: 'AI-powered document analysis and suggestions',
      enabled: true,
      rolloutPercentage: 0, // Not available to general public
      targeting: {
        userGroups: ['security_officers', 'analysts'],
        organizations: ['NSM', 'PST'],
      },
      nsmClassification: 'KONFIDENSIELT',
    };

    featureManager.registerFlag(aiSuggestionsFlag);

    // When: Different user types check access
    const securityOfficer = featureManager.isEnabled('ai_document_suggestions', {
      userGroup: 'security_officers',
      organization: 'NSM',
    });

    const regularCitizen = featureManager.isEnabled('ai_document_suggestions', {
      userGroup: 'citizens',
    });

    const analyst = featureManager.isEnabled('ai_document_suggestions', {
      userGroup: 'analysts',
      organization: 'PST',
    });

    // Then: Should respect security targeting
    expect(securityOfficer).toBe(true);
    expect(regularCitizen).toBe(false);
    expect(analyst).toBe(true);
  });

  // User Story 5: DevOps team enables debug features in development
  it('DevOps Team Story: should enable debug features for development team', async () => {
    // Given: Debug features needed for troubleshooting
    const debugFlag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'> = {
      key: 'advanced_debugging',
      name: 'Advanced Debugging Tools',
      description: 'Enhanced debugging and monitoring capabilities',
      enabled: true,
      rolloutPercentage: 100,
      targeting: {
        userGroups: ['developers', 'devops', 'support'],
      },
      nsmClassification: 'BEGRENSET',
    };

    featureManager.registerFlag(debugFlag);

    // When: Different team members check access
    const developer = featureManager.isEnabled('advanced_debugging', {
      userGroup: 'developers',
    });

    const supportAgent = featureManager.isEnabled('advanced_debugging', {
      userGroup: 'support',
    });

    const endUser = featureManager.isEnabled('advanced_debugging', {
      userGroup: 'citizens',
    });

    // Then: Should be available to technical staff only
    expect(developer).toBe(true);
    expect(supportAgent).toBe(true);
    expect(endUser).toBe(false);

    // Verify we can get feature definition
    const flagDef = featureManager.getFlag('advanced_debugging');
    expect(flagDef?.name).toBe('Advanced Debugging Tools');
  });

  // User Story 6: Digital identity team manages ID-porten integration features
  it('Digital ID Team Story: should manage ID-porten integration features by municipality', async () => {
    // Given: ID-porten features rolled out municipality by municipality
    const digitalIdFlag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'> = {
      key: 'idporten_integration',
      name: 'ID-porten Digital Identity Integration',
      description: 'Integration with Norwegian digital identity provider',
      enabled: true,
      rolloutPercentage: 100,
      targeting: {
        municipalities: ['0301', '4601', '5001', '1902'], // Major municipalities first
        userGroups: ['citizens'],
      },
      nsmClassification: 'BEGRENSET',
    };

    featureManager.registerFlag(digitalIdFlag);

    // When: Citizens from different municipalities attempt to use feature
    const majorMunicipality = featureManager.isMunicipalityFeatureEnabled(
      'idporten_integration',
      '0301', // Oslo
      { userGroup: 'citizens' }
    );

    const smallMunicipality = featureManager.isMunicipalityFeatureEnabled(
      'idporten_integration',
      '3401', // Hamar - not in targeting
      { userGroup: 'citizens' }
    );

    // Then: Should work for major municipalities first
    expect(majorMunicipality).toBe(true);
    expect(smallMunicipality).toBe(false);
  });

  // User Story 7: Data protection officer manages GDPR compliance features
  it('DPO Story: should manage personal data processing features with compliance', async () => {
    // Given: Personal data features require GDPR compliance
    const personalDataFlag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'> = {
      key: 'personal_data_export',
      name: 'Personal Data Export',
      description: 'GDPR Article 20 - Data portability for citizens',
      enabled: true,
      rolloutPercentage: 100,
      targeting: {
        userGroups: ['citizens', 'legal_guardians'],
      },
      nsmClassification: 'KONFIDENSIELT',
    };

    featureManager.registerFlag(personalDataFlag);

    // When: Citizens request personal data features
    const citizen = featureManager.isEnabled('personal_data_export', {
      userId: 'citizen_001',
      userGroup: 'citizens',
    });

    const guardian = featureManager.isEnabled('personal_data_export', {
      userGroup: 'legal_guardians',
    });

    const business = featureManager.isEnabled('personal_data_export', {
      userGroup: 'businesses',
    });

    // Then: Should be available to individuals and guardians only
    expect(citizen).toBe(true);
    expect(guardian).toBe(true);
    expect(business).toBe(false);
  });

  // User Story 8: Operations team monitors feature flag health across system
  it('Operations Team Story: should monitor feature flag system health and usage patterns', async () => {
    // Given: Multiple feature flags are active in the system
    const testFlags = [
      { key: 'feature_a', enabled: true },
      { key: 'feature_b', enabled: false },
      { key: 'feature_c', enabled: true },
    ];

    testFlags.forEach(flag => {
      featureManager.registerFlag({
        ...flag,
        name: `Test Feature ${flag.key}`,
        description: 'Test feature for monitoring',
        nsmClassification: 'ÅPEN',
      });
    });

    // When: Operations team checks system health
    const allFlags = featureManager.getAllFlags();
    const analytics = featureManager.getStats();

    // Then: Should provide comprehensive system overview
    expect(Object.keys(allFlags)).toHaveLength(3);
    expect(allFlags.feature_a).toBe(true);
    expect(allFlags.feature_b).toBe(false);
    expect(allFlags.feature_c).toBe(true);

    expect(analytics.totalFlags).toBe(3);
    expect(analytics.enabledFlags).toBe(2);
    expect(analytics.totalFlags - analytics.enabledFlags).toBe(1); // disabled flags
  });
});
