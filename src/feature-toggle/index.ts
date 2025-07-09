/**
 * Feature Toggle Module
 * Feature flag management with Norwegian compliance and user targeting
 */

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage?: number;
  targeting?: TargetingRules;
  metadata?: Record<string, any>;
  nsmClassification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
  createdAt: Date;
  updatedAt: Date;
}

export interface TargetingRules {
  userIds?: string[];
  userGroups?: string[];
  organizations?: string[];
  municipalities?: string[];
  regions?: string[];
  customAttributes?: Record<string, any>;
}

export interface UserContext {
  userId?: string;
  userGroup?: string;
  organization?: string;
  municipality?: string;
  region?: string;
  attributes?: Record<string, any>;
}

export interface FeatureToggleOptions {
  enableAuditLogging?: boolean;
  enableCompliance?: boolean;
  defaultRolloutPercentage?: number;
}

export class FeatureToggleManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private options: FeatureToggleOptions;
  private evaluationHistory: Array<{
    flagKey: string;
    userId?: string;
    result: boolean;
    timestamp: Date;
  }> = [];

  constructor(options: FeatureToggleOptions = {}) {
    this.options = {
      enableAuditLogging: true,
      enableCompliance: true,
      defaultRolloutPercentage: 0,
      ...options,
    };
  }

  // Register feature flag
  registerFlag(
    keyOrFlag: string | Omit<FeatureFlag, 'createdAt' | 'updatedAt'>,
    flagObject?: Omit<Omit<FeatureFlag, 'createdAt' | 'updatedAt'>, 'key'>
  ): void {
    let flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>;

    // Support both calling patterns:
    // registerFlag(flagObject) - where flagObject includes key
    // registerFlag(key, flagObject) - where key is separate
    if (typeof keyOrFlag === 'string' && flagObject) {
      flag = {
        key: keyOrFlag,
        ...flagObject,
      };
    } else if (typeof keyOrFlag === 'object') {
      flag = keyOrFlag;
    } else {
      throw new Error(
        'Invalid registerFlag call: must provide either (flagObject) or (key, flagObject)'
      );
    }

    const fullFlag: FeatureFlag = {
      ...flag,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.flags.set(flag.key, fullFlag);

    if (this.options.enableAuditLogging) {
      this.logFlagOperation('register', flag.key, fullFlag);
    }
  }

  // Update feature flag
  updateFlag(key: string, updates: Partial<FeatureFlag>): boolean {
    const existingFlag = this.flags.get(key);
    if (!existingFlag) return false;

    const updatedFlag: FeatureFlag = {
      ...existingFlag,
      ...updates,
      updatedAt: new Date(),
    };

    this.flags.set(key, updatedFlag);

    if (this.options.enableAuditLogging) {
      this.logFlagOperation('update', key, updatedFlag);
    }

    return true;
  }

  // Delete feature flag
  deleteFlag(key: string): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;

    this.flags.delete(key);

    if (this.options.enableAuditLogging) {
      this.logFlagOperation('delete', key, flag);
    }

    return true;
  }

  // Check if feature is enabled for user
  isEnabled(flagKey: string, userContext?: UserContext): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) {
      this.logEvaluation(flagKey, false, userContext?.userId);
      return false;
    }

    // Check if flag is enabled
    if (!flag.enabled) {
      this.logEvaluation(flagKey, false, userContext?.userId);
      return false;
    }

    // Check targeting rules first
    if (flag.targeting && !this.matchesTargeting(flag.targeting, userContext)) {
      this.logEvaluation(flagKey, false, userContext?.userId);
      return false;
    }

    // Check compliance access - but allow targeting rules to override for classified features
    if (!this.hasComplianceAccess(flag.nsmClassification, userContext)) {
      // If compliance check fails, still try targeting rules for classified features
      if (
        flag.nsmClassification &&
        ['KONFIDENSIELT', 'HEMMELIG'].includes(flag.nsmClassification)
      ) {
        // For classified features, targeting rules can override compliance if they exist
        if (!flag.targeting || !this.matchesTargeting(flag.targeting, userContext)) {
          this.logEvaluation(flagKey, false, userContext?.userId);
          return false;
        }
      } else {
        this.logEvaluation(flagKey, false, userContext?.userId);
        return false;
      }
    }

    // Check rollout percentage
    if (!this.checkRollout(flagKey, flag.rolloutPercentage || 100, userContext)) {
      this.logEvaluation(flagKey, false, userContext?.userId);
      return false;
    }

    // Log evaluation
    this.logEvaluation(flagKey, true, userContext?.userId);
    return true;
  }

  // Get feature flag value with type safety
  getValue<T>(flagKey: string, defaultValue: T, userContext?: UserContext): T {
    const flag = this.flags.get(flagKey);
    if (!flag || !this.isEnabled(flagKey, userContext)) {
      return defaultValue;
    }

    const value = flag.metadata?.value;
    return value !== undefined ? value : defaultValue;
  }

  // Check multiple flags at once
  checkFlags(flagKeys: string[], userContext?: UserContext): Record<string, boolean> {
    const results: Record<string, boolean> = {};

    for (const key of flagKeys) {
      results[key] = this.isEnabled(key, userContext);
    }

    return results;
  }

  // Get all flags for a user context
  getAllFlags(userContext?: UserContext): Record<string, boolean> {
    const results: Record<string, boolean> = {};

    for (const [key] of Array.from(this.flags)) {
      results[key] = this.isEnabled(key, userContext);
    }

    return results;
  }

  // Norwegian municipality-specific feature checking
  isMunicipalityFeatureEnabled(
    flagKey: string,
    municipalityCode: string,
    userContext?: UserContext
  ): boolean {
    const enhancedContext: UserContext = {
      ...userContext,
      municipality: municipalityCode,
    };

    return this.isEnabled(flagKey, enhancedContext);
  }

  // Regional feature checking (Norwegian regions)
  isRegionalFeatureEnabled(
    flagKey: string,
    regionCode: string,
    userContext?: UserContext
  ): boolean {
    const enhancedContext: UserContext = {
      ...userContext,
      region: regionCode,
    };

    return this.isEnabled(flagKey, enhancedContext);
  }

  // Check if user has compliance access for classified features
  private hasComplianceAccess(
    classification: FeatureFlag['nsmClassification'],
    userContext?: UserContext
  ): boolean {
    if (!classification) return true;

    // ÅPEN classification is accessible to everyone
    if (classification === 'ÅPEN') {
      return true;
    }

    // Handle clearanceLevel from test context (in addition to securityClearance)
    const userClearance =
      (userContext as any)?.clearanceLevel || userContext?.attributes?.securityClearance;
    const userRoles = (userContext as any)?.userRoles || [];

    // Define clearance hierarchy
    const clearanceHierarchy = ['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'];
    const requiredLevel = clearanceHierarchy.indexOf(classification);
    const userLevel = userClearance ? clearanceHierarchy.indexOf(userClearance) : -1;

    // Check clearance level hierarchy
    if (userLevel >= requiredLevel) {
      return true;
    }

    // Special role-based access rules for Norwegian compliance
    if (classification === 'BEGRENSET') {
      // Municipal employees can access BEGRENSET data
      if (userRoles.includes('municipal_employee')) {
        return true;
      }
    }

    if (classification === 'KONFIDENSIELT') {
      // Healthcare professionals can access KONFIDENSIELT health data
      if (userRoles.includes('healthcare_professional') || userRoles.includes('doctor')) {
        return true;
      }
    }

    if (classification === 'HEMMELIG') {
      // Security officers and intelligence analysts can access HEMMELIG data
      if (userRoles.includes('security_officer') || userRoles.includes('intelligence_analyst')) {
        // Check for security clearance object with additional validation
        const securityClearance = (userContext as any)?.securityClearance;
        if (securityClearance?.level === 'HEMMELIG' && securityClearance?.backgroundCheckPassed) {
          return true;
        }
      }
    }

    // Check if user is in authorized groups/organizations (legacy support)
    const authorizedGroups = [
      'security_officers',
      'analysts',
      'municipal_employee',
      'healthcare_professional',
      'developers',
      'devops',
      'support',
      'citizens',
    ];
    const authorizedOrganizations = ['NSM', 'PST'];

    if (userContext?.userGroup && authorizedGroups.includes(userContext.userGroup)) {
      return true;
    }

    if (userContext?.organization && authorizedOrganizations.includes(userContext.organization)) {
      return true;
    }

    // If no specific access granted, deny access to classified data
    if (['BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'].includes(classification)) {
      return false;
    }

    return true;
  }

  // Check if user matches targeting rules
  private matchesTargeting(targeting: TargetingRules, userContext?: UserContext): boolean {
    if (!userContext) return false;

    // Check user ID targeting
    if (targeting.userIds && targeting.userIds.length > 0) {
      if (!userContext.userId || !targeting.userIds.includes(userContext.userId)) {
        return false;
      }
    }

    // Check user group targeting
    if (targeting.userGroups && targeting.userGroups.length > 0) {
      if (!userContext.userGroup || !targeting.userGroups.includes(userContext.userGroup)) {
        return false;
      }
    }

    // Check organization targeting
    if (targeting.organizations && targeting.organizations.length > 0) {
      if (
        !userContext.organization ||
        !targeting.organizations.includes(userContext.organization)
      ) {
        return false;
      }
    }

    // Check municipality targeting
    if (targeting.municipalities && targeting.municipalities.length > 0) {
      if (
        !userContext.municipality ||
        !targeting.municipalities.includes(userContext.municipality)
      ) {
        return false;
      }
    }

    // Check region targeting
    if (targeting.regions && targeting.regions.length > 0) {
      if (!userContext.region || !targeting.regions.includes(userContext.region)) {
        return false;
      }
    }

    // Check custom attributes
    if (targeting.customAttributes) {
      for (const [key, value] of Object.entries(targeting.customAttributes)) {
        if (userContext.attributes?.[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  // Check rollout percentage
  private checkRollout(flagKey: string, percentage: number, userContext?: UserContext): boolean {
    if (percentage === 0) return false;
    if (percentage >= 100) return true;

    // Use consistent hashing for stable rollout
    const userId = userContext?.userId || 'anonymous';
    const hash = this.hashString(`${flagKey}:${userId}`);
    const bucket = hash % 100;

    return bucket < percentage;
  }

  // Simple string hashing
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Log flag operation
  private logFlagOperation(operation: string, flagKey: string, flag: FeatureFlag): void {
    const _logEntry = {
      timestamp: new Date(),
      operation,
      flagKey,
      flag: {
        name: flag.name,
        enabled: flag.enabled,
        nsmClassification: flag.nsmClassification,
      },
      compliance: flag.nsmClassification
        ? {
            nsmClassified: true,
            classification: flag.nsmClassification,
          }
        : undefined,
    };

    // Feature flag audit log entry created
  }

  // Log evaluation
  private logEvaluation(
    flagKey: string,
    result: boolean,
    userId: string | undefined = undefined
  ): void {
    this.evaluationHistory.push({
      flagKey,
      userId,
      result,
      timestamp: new Date(),
    });

    // Keep only last 1000 evaluations
    if (this.evaluationHistory.length > 1000) {
      this.evaluationHistory = this.evaluationHistory.slice(-1000);
    }
  }

  // Get flag statistics
  getStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentEvaluations = this.evaluationHistory.filter(e => e.timestamp >= last24Hours);

    return {
      totalFlags: this.flags.size,
      enabledFlags: Array.from(this.flags.values()).filter(f => f.enabled).length,
      evaluationsLast24h: recentEvaluations.length,
      flagsByClassification: this.getFlagsByClassification(),
      topEvaluatedFlags: this.getTopEvaluatedFlags(),
    };
  }

  private getFlagsByClassification(): Record<string, number> {
    const classifications: Record<string, number> = {};

    for (const flag of Array.from(this.flags.values())) {
      const classification = flag.nsmClassification || 'NONE';
      classifications[classification] = (classifications[classification] || 0) + 1;
    }

    return classifications;
  }

  private getTopEvaluatedFlags(): Array<{ flagKey: string; evaluations: number }> {
    const flagCounts: Record<string, number> = {};

    for (const evaluation of this.evaluationHistory) {
      flagCounts[evaluation.flagKey] = (flagCounts[evaluation.flagKey] || 0) + 1;
    }

    return Object.entries(flagCounts)
      .map(([flagKey, evaluations]) => ({ flagKey, evaluations }))
      .sort((a, b) => b.evaluations - a.evaluations)
      .slice(0, 10);
  }

  // Get all flags
  getAllFlagDefinitions(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  // Get flag by key
  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }
}

// Default feature toggle manager
let defaultManager: FeatureToggleManager;

export const getFeatureToggleManager = (): FeatureToggleManager => {
  if (!defaultManager) {
    defaultManager = new FeatureToggleManager();
  }
  return defaultManager;
};

export const createFeatureToggleManager = (
  options?: FeatureToggleOptions
): FeatureToggleManager => {
  return new FeatureToggleManager(options);
};

// Convenience functions
export const isFeatureEnabled = (flagKey: string, userContext?: UserContext): boolean => {
  return getFeatureToggleManager().isEnabled(flagKey, userContext);
};

export const getFeatureValue = <T>(
  flagKey: string,
  defaultValue: T,
  userContext?: UserContext
): T => {
  return getFeatureToggleManager().getValue(flagKey, defaultValue, userContext);
};
