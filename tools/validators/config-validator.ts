import { readFileSync, existsSync } from 'fs';
import { createLogger } from '../../src/logger/index.js';

const logger = createLogger({
  level: 'info',
  auditEnabled: true,
  complianceEnabled: true,
});

export interface ValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ValidationOptions {
  strict?: boolean;
  format?: 'json' | 'table' | 'detailed';
}

export async function validateConfiguration(
  configPath: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const { strict = false, format = 'table' } = options;

  logger.info('Validating configuration', { configPath, options });

  const result: ValidationResult = {
    valid: true,
    score: 0,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  try {
    // Check if config file exists
    if (!existsSync(configPath)) {
      result.errors.push(`Configuration file not found: ${configPath}`);
      result.valid = false;
      return result;
    }

    // Parse configuration
    const configContent = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    // Validate required fields
    const requiredFields = ['platform', 'language', 'compliance'];
    for (const field of requiredFields) {
      if (!config[field]) {
        result.errors.push(`Missing required field: ${field}`);
        result.valid = false;
      }
    }

    // Validate Norwegian compliance
    await validateNorwegianCompliance(config, result, strict);

    // Validate platform-specific configuration
    await validatePlatformConfig(config, result, strict);

    // Validate security settings
    await validateSecurityConfig(config, result, strict);

    // Validate module configuration
    await validateModuleConfig(config, result, strict);

    // Calculate score
    result.score = calculateComplianceScore(result);

    // Format output
    if (format === 'detailed') {
      logDetailedResults(result);
    } else if (format === 'table') {
      logTableResults(result);
    }

    return result;
  } catch (error) {
    result.errors.push(
      `Configuration validation failed: ${error instanceof Error ? error.message : error}`
    );
    result.valid = false;
    return result;
  }
}

async function validateNorwegianCompliance(
  config: any,
  result: ValidationResult,
  strict: boolean
): Promise<void> {
  const compliance = config.compliance;

  if (!compliance) {
    result.errors.push('Missing compliance configuration');
    return;
  }

  // Validate NSM classification
  const validNSMClassifications = ['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG'];
  if (!validNSMClassifications.includes(compliance.nsmClassification)) {
    result.errors.push(`Invalid NSM classification: ${compliance.nsmClassification}`);
  }

  // Validate GDPR compliance
  if (compliance.gdprEnabled !== true) {
    result.warnings.push('GDPR compliance should be enabled for Norwegian government services');
  }

  // Validate audit requirements
  if (compliance.auditRequired !== true) {
    result.warnings.push('Audit trail should be enabled for Norwegian government services');
  }

  // Validate retention period
  if (!compliance.retentionPeriod || !compliance.retentionPeriod.match(/^P\d+Y$/)) {
    result.errors.push('Invalid retention period format. Use ISO 8601 duration format (e.g., P7Y)');
  }

  // Validate municipality code
  if (config.municipality && !config.municipality.match(/^\d{4}$/)) {
    result.errors.push('Invalid municipality code. Use 4-digit format (e.g., 0301 for Oslo)');
  }

  // Validate language
  const validLanguages = ['nb', 'nn', 'en'];
  if (!validLanguages.includes(config.language)) {
    result.errors.push(`Invalid language: ${config.language}. Use: ${validLanguages.join(', ')}`);
  }

  // Strict mode checks
  if (strict) {
    if (!config.norwegian?.digdirIntegration) {
      result.errors.push('DigDir integration must be enabled in strict mode');
    }

    if (!config.norwegian?.idPortenReady) {
      result.errors.push('ID-porten readiness must be enabled in strict mode');
    }
  }
}

async function validatePlatformConfig(
  config: any,
  result: ValidationResult,
  strict: boolean
): Promise<void> {
  const validPlatforms = ['web', 'mobile', 'desktop', 'api'];

  if (!validPlatforms.includes(config.platform)) {
    result.errors.push(`Invalid platform: ${config.platform}. Use: ${validPlatforms.join(', ')}`);
  }

  // Platform-specific validation
  switch (config.platform) {
    case 'web':
      validateWebPlatform(config, result, strict);
      break;
    case 'mobile':
      validateMobilePlatform(config, result, strict);
      break;
    case 'desktop':
      validateDesktopPlatform(config, result, strict);
      break;
    case 'api':
      validateAPIPlatform(config, result, strict);
      break;
  }
}

function validateWebPlatform(config: any, result: ValidationResult, strict: boolean): void {
  if (config.modules?.webStorage?.enabled && !config.modules?.webStorage?.compliance) {
    result.warnings.push('Web storage compliance metadata should be configured');
  }

  if (strict && !config.modules?.webAnalytics?.enabled) {
    result.suggestions.push('Consider enabling web analytics for better insights');
  }
}

function validateMobilePlatform(config: any, result: ValidationResult, strict: boolean): void {
  if (!config.modules?.offlineSupport?.enabled) {
    result.suggestions.push('Consider enabling offline support for mobile applications');
  }

  if (strict && !config.modules?.mobileStorage?.encryption) {
    result.warnings.push('Mobile storage encryption should be enabled in strict mode');
  }
}

function validateDesktopPlatform(config: any, result: ValidationResult, strict: boolean): void {
  if (!config.modules?.ipcBridge?.enabled) {
    result.suggestions.push('Consider enabling IPC bridge for desktop applications');
  }

  if (strict && !config.modules?.desktopStorage?.encryption) {
    result.warnings.push('Desktop storage encryption should be enabled in strict mode');
  }
}

function validateAPIPlatform(config: any, result: ValidationResult, strict: boolean): void {
  if (!config.modules?.distributedEvents?.enabled) {
    result.suggestions.push('Consider enabling distributed events for API services');
  }

  if (strict && !config.modules?.apiMetrics?.enabled) {
    result.warnings.push('API metrics should be enabled in strict mode');
  }
}

async function validateSecurityConfig(
  config: any,
  result: ValidationResult,
  strict: boolean
): Promise<void> {
  const security = config.security;

  if (!security) {
    result.warnings.push('Security configuration is missing');
    return;
  }

  // Validate encryption settings
  if (config.compliance?.nsmClassification !== 'ÅPEN' && !security.encryption) {
    result.errors.push('Encryption must be enabled for classified information');
  }

  // Validate audit trail
  if (!security.auditTrail) {
    result.warnings.push('Audit trail should be enabled for Norwegian government services');
  }

  // Validate access control
  if (config.compliance?.nsmClassification !== 'ÅPEN' && !security.accessControl) {
    result.errors.push('Access control must be enabled for classified information');
  }

  // Strict mode checks
  if (strict) {
    if (!security.twoFactorAuth) {
      result.suggestions.push('Consider enabling two-factor authentication for enhanced security');
    }

    if (!security.sessionTimeout) {
      result.suggestions.push('Consider configuring session timeout for security');
    }
  }
}

async function validateModuleConfig(
  config: any,
  result: ValidationResult,
  strict: boolean
): Promise<void> {
  const modules = config.modules;

  if (!modules) {
    result.warnings.push('Module configuration is missing');
    return;
  }

  // Validate required modules
  const requiredModules = ['logger', 'errorHandler', 'healthcheck'];
  for (const module of requiredModules) {
    if (!modules[module]?.enabled) {
      result.errors.push(`Required module not enabled: ${module}`);
    }
  }

  // Validate logger configuration
  if (modules.logger) {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLevels.includes(modules.logger.level)) {
      result.errors.push(`Invalid logger level: ${modules.logger.level}`);
    }
  }

  // Validate i18n configuration
  if (modules.i18n) {
    if (!modules.i18n.supportedLanguages?.includes(config.language)) {
      result.errors.push('Default language must be included in supported languages');
    }
  }

  // Strict mode checks
  if (strict) {
    if (!modules.metrics?.enabled) {
      result.warnings.push('Metrics collection should be enabled in strict mode');
    }

    if (!modules.featureToggle?.enabled) {
      result.suggestions.push('Consider enabling feature toggles for better deployment control');
    }
  }
}

function calculateComplianceScore(result: ValidationResult): number {
  let score = 100;

  // Deduct points for errors
  score -= result.errors.length * 20;

  // Deduct points for warnings
  score -= result.warnings.length * 5;

  // Ensure score is not negative
  score = Math.max(0, score);

  return Math.round(score);
}

function logDetailedResults(result: ValidationResult): void {
  console.log('\n📋 Detailed Validation Results');
  console.log('='.repeat(50));

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (result.suggestions.length > 0) {
    console.log('\n💡 Suggestions:');
    result.suggestions.forEach(suggestion => console.log(`   - ${suggestion}`));
  }

  console.log(`\n📊 Compliance Score: ${result.score}/100`);
}

function logTableResults(result: ValidationResult): void {
  console.log('\n📋 Validation Summary');
  console.log('┌─────────────────┬───────────────────┐');
  console.log('│ Metric          │ Count             │');
  console.log('├─────────────────┼───────────────────┤');
  console.log(`│ Errors          │ ${result.errors.length.toString().padStart(17)} │`);
  console.log(`│ Warnings        │ ${result.warnings.length.toString().padStart(17)} │`);
  console.log(`│ Suggestions     │ ${result.suggestions.length.toString().padStart(17)} │`);
  console.log(`│ Score           │ ${result.score.toString().padStart(14)}/100 │`);
  console.log('└─────────────────┴───────────────────┘');
}
