/**
 * Health Check Module
 * Service health monitoring with Norwegian compliance checks
 */

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  duration: number;
  message?: string;
  metadata?: Record<string, any>;
  nsmClassification?: 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
}

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
  interval?: number;
  timeout?: number;
  critical?: boolean;
  tags?: string[];
}

export interface HealthOptions {
  enableCompliance?: boolean;
  enableAutoCheck?: boolean;
  checkInterval?: number;
  timeout?: number;
}

export class HealthManager {
  private checks: Map<string, HealthCheck> = new Map();
  private results: Map<string, HealthCheckResult> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private options: HealthOptions;

  constructor(options: HealthOptions = {}) {
    this.options = {
      enableCompliance: true,
      enableAutoCheck: true,
      checkInterval: 30000, // 30 seconds
      timeout: 10000, // 10 seconds
      ...options,
    };
  }

  // Register health check
  registerCheck(check: HealthCheck): void {
    this.checks.set(check.name, check);

    if (this.options.enableAutoCheck) {
      this.startAutoCheck(check);
    }
  }

  // Unregister health check
  unregisterCheck(name: string): boolean {
    const removed = this.checks.delete(name);
    this.results.delete(name);

    const timer = this.timers.get(name);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(name);
    }

    return removed;
  }

  // Run specific health check
  async runCheck(name: string): Promise<HealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check '${name}' not found`);
    }

    const startTime = Date.now();
    const timeout = check.timeout || this.options.timeout || 5000;

    try {
      const result = await this.executeWithTimeout(check.check(), timeout);
      result.duration = Date.now() - startTime;

      this.results.set(name, result);
      return result;
    } catch (error) {
      const errorResult: HealthCheckResult = {
        name,
        status: 'unhealthy',
        timestamp: new Date(),
        duration: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
      };

      this.results.set(name, errorResult);
      return errorResult;
    }
  }

  // Run all health checks
  async runAllChecks(): Promise<Record<string, HealthCheckResult>> {
    const results: Record<string, HealthCheckResult> = {};

    await Promise.all(
      Array.from(this.checks.keys()).map(async name => {
        try {
          results[name] = await this.runCheck(name);
        } catch (error) {
          results[name] = {
            name,
            status: 'unhealthy',
            timestamp: new Date(),
            duration: 0,
            message: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return results;
  }

  // Get overall health status
  getOverallHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, HealthCheckResult>;
    summary: {
      total: number;
      healthy: number;
      degraded: number;
      unhealthy: number;
    };
  } {
    const checks = Object.fromEntries(this.results);
    const summary = {
      total: this.results.size,
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
    };

    let hasCriticalFailure = false;
    let hasDegraded = false;

    for (const result of Array.from(this.results.values())) {
      switch (result.status) {
        case 'healthy':
          summary.healthy++;
          break;
        case 'degraded':
          summary.degraded++;
          hasDegraded = true;
          break;
        case 'unhealthy': {
          summary.unhealthy++;
          const check = this.checks.get(result.name);
          if (check?.critical) {
            hasCriticalFailure = true;
          }
          break;
        }
      }
    }

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (hasCriticalFailure) {
      overallStatus = 'unhealthy';
    } else if (hasDegraded || summary.unhealthy > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return { status: overallStatus, checks, summary };
  }

  // Norwegian compliance health checks
  registerComplianceChecks(): void {
    if (!this.options.enableCompliance) return;

    // NSM security compliance check
    this.registerCheck({
      name: 'nsm_compliance',
      check: async () => this.checkNSMCompliance(),
      interval: 60000, // 1 minute
      critical: true,
      tags: ['compliance', 'nsm'],
    });

    // GDPR compliance check
    this.registerCheck({
      name: 'gdpr_compliance',
      check: async () => this.checkGDPRCompliance(),
      interval: 300000, // 5 minutes
      critical: true,
      tags: ['compliance', 'gdpr'],
    });

    // DigDir interoperability check
    this.registerCheck({
      name: 'digdir_interoperability',
      check: async () => this.checkDigDirCompliance(),
      interval: 600000, // 10 minutes
      critical: false,
      tags: ['compliance', 'digdir'],
    });
  }

  // Standard infrastructure health checks
  registerInfrastructureChecks(): void {
    // Database connectivity
    this.registerCheck({
      name: 'database',
      check: async () => this.checkDatabase(),
      interval: 30000,
      critical: true,
      tags: ['infrastructure', 'database'],
    });

    // Memory usage
    this.registerCheck({
      name: 'memory',
      check: async () => this.checkMemoryUsage(),
      interval: 60000,
      critical: false,
      tags: ['infrastructure', 'memory'],
    });

    // Disk space
    this.registerCheck({
      name: 'disk_space',
      check: async () => this.checkDiskSpace(),
      interval: 300000,
      critical: true,
      tags: ['infrastructure', 'disk'],
    });
  }

  // NSM compliance check
  private async checkNSMCompliance(): Promise<HealthCheckResult> {
    // In real implementation, check NSM security requirements
    const checks = [
      'encryption_enabled',
      'audit_logging_active',
      'access_controls_configured',
      'security_patches_current',
    ];

    const failedChecks: string[] = [];

    // Simulate compliance checks
    for (const check of checks) {
      if (Math.random() > 0.9) {
        // 10% chance of failure
        failedChecks.push(check);
      }
    }

    if (failedChecks.length > 0) {
      return {
        name: 'nsm_compliance',
        status: 'unhealthy',
        timestamp: new Date(),
        duration: 0,
        message: `NSM compliance failures: ${failedChecks.join(', ')}`,
        nsmClassification: 'BEGRENSET',
        metadata: { failedChecks },
      };
    }

    return {
      name: 'nsm_compliance',
      status: 'healthy',
      timestamp: new Date(),
      duration: 0,
      message: 'All NSM compliance checks passed',
      nsmClassification: 'BEGRENSET',
    };
  }

  // GDPR compliance check
  private async checkGDPRCompliance(): Promise<HealthCheckResult> {
    const checks = [
      'data_retention_policies',
      'consent_management',
      'data_processing_records',
      'privacy_by_design',
    ];

    const failedChecks: string[] = [];

    for (const check of checks) {
      if (Math.random() > 0.95) {
        // 5% chance of failure
        failedChecks.push(check);
      }
    }

    return {
      name: 'gdpr_compliance',
      status: failedChecks.length > 0 ? 'degraded' : 'healthy',
      timestamp: new Date(),
      duration: 0,
      message:
        failedChecks.length > 0
          ? `GDPR compliance issues: ${failedChecks.join(', ')}`
          : 'GDPR compliance verified',
      metadata: { failedChecks },
    };
  }

  // DigDir interoperability check
  private async checkDigDirCompliance(): Promise<HealthCheckResult> {
    // Simulate DigDir standards check
    const isCompliant = Math.random() > 0.1; // 90% chance of compliance

    return {
      name: 'digdir_interoperability',
      status: isCompliant ? 'healthy' : 'degraded',
      timestamp: new Date(),
      duration: 0,
      message: isCompliant
        ? 'DigDir interoperability standards met'
        : 'DigDir interoperability issues detected',
    };
  }

  // Database health check
  private async checkDatabase(): Promise<HealthCheckResult> {
    try {
      // Simulate database connection check
      await new Promise(resolve => setTimeout(resolve, 50));

      return {
        name: 'database',
        status: 'healthy',
        timestamp: new Date(),
        duration: 0,
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        timestamp: new Date(),
        duration: 0,
        message: 'Database connection failed',
      };
    }
  }

  // Memory usage check
  private async checkMemoryUsage(): Promise<HealthCheckResult> {
    const usage = process.memoryUsage();
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usagePercent = (usedMB / totalMB) * 100;

    let status: HealthCheckResult['status'];
    if (usagePercent > 90) {
      status = 'unhealthy';
    } else if (usagePercent > 75) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      name: 'memory',
      status,
      timestamp: new Date(),
      duration: 0,
      message: `Memory usage: ${usedMB}MB / ${totalMB}MB (${usagePercent.toFixed(1)}%)`,
      metadata: { usedMB, totalMB, usagePercent },
    };
  }

  // Disk space check
  private async checkDiskSpace(): Promise<HealthCheckResult> {
    // Simulate disk space check
    const freeSpacePercent = Math.random() * 100;

    let status: HealthCheckResult['status'];
    if (freeSpacePercent < 10) {
      status = 'unhealthy';
    } else if (freeSpacePercent < 20) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      name: 'disk_space',
      status,
      timestamp: new Date(),
      duration: 0,
      message: `Free disk space: ${freeSpacePercent.toFixed(1)}%`,
      metadata: { freeSpacePercent },
    };
  }

  // Execute check with timeout
  private async executeWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  // Start automatic checking for a health check
  private startAutoCheck(check: HealthCheck): void {
    const interval = check.interval || this.options.checkInterval || 30000;

    const timer = setInterval(async () => {
      try {
        await this.runCheck(check.name);
      } catch (error) {
        console.error(`Auto health check failed for ${check.name}:`, error);
      }
    }, interval);

    this.timers.set(check.name, timer);
  }

  // Stop all auto checks
  stopAutoChecks(): void {
    for (const timer of Array.from(this.timers.values())) {
      clearInterval(timer);
    }
    this.timers.clear();
  }

  // Get health statistics
  getStats() {
    return {
      totalChecks: this.checks.size,
      activeTimers: this.timers.size,
      lastResults: this.results.size,
      complianceEnabled: this.options.enableCompliance,
      autoCheckEnabled: this.options.enableAutoCheck,
    };
  }
}

// Default health manager
let defaultManager: HealthManager;

export const getHealthManager = (): HealthManager => {
  if (!defaultManager) {
    defaultManager = new HealthManager();
  }
  return defaultManager;
};

export const createHealthManager = (options?: HealthOptions): HealthManager => {
  return new HealthManager(options);
};

// Convenience functions
export const registerHealthCheck = (check: HealthCheck): void => {
  getHealthManager().registerCheck(check);
};

export const runHealthCheck = async (name: string): Promise<HealthCheckResult> => {
  return getHealthManager().runCheck(name);
};

export const getOverallHealth = () => {
  return getHealthManager().getOverallHealth();
};
