import { existsSync, readFileSync, writeFileSync } from 'fs';
import type { FoundationConfig } from '../../src/config-loader/index.js';
import { createLogger } from '../../src/logger/index.js';

const logger = createLogger({
  level: 'info',
  auditEnabled: true,
  complianceEnabled: true,
});

export interface ComplianceResult {
  compliant: boolean;
  score: number;
  issues: ComplianceIssue[];
  recommendations: string[];
}

export interface ComplianceIssue {
  type: 'nsm' | 'gdpr' | 'digdir' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requirement: string;
  remediation: string;
}

export interface ComplianceOptions {
  type?: 'nsm' | 'gdpr' | 'digdir' | 'all';
  report?: string;
  verbose?: boolean;
}

interface ProjectConfig {
  'foundation.config'?: FoundationConfig;
  package?: Record<string, unknown>;
  tsconfig?: Record<string, unknown>;
  [key: string]: unknown;
}

class ComplianceChecker {
  private norwegianMunicipalities = new Set([
    '0301',
    '0219',
    '4601',
    '5001',
    '1103',
    '1601',
    '1504',
    '1902',
    '1506',
    '1804',
  ]);

  private nsmClassifications = new Set(['ÅPEN', 'BEGRENSET', 'KONFIDENSIELT', 'HEMMELIG']);

  async check(options: ComplianceOptions = {}): Promise<ComplianceResult> {
    const { type = 'all', report, verbose = false } = options;

    logger.info('Starting compliance check', { type, verbose });

    const result: ComplianceResult = {
      compliant: true,
      score: 0,
      issues: [],
      recommendations: [],
    };

    try {
      // Load project configuration
      const config = await this.loadProjectConfig();

      // Run compliance checks based on type
      if (type === 'nsm' || type === 'all') {
        await this.checkNSMCompliance(config, result);
      }

      if (type === 'gdpr' || type === 'all') {
        await this.checkGDPRCompliance(config, result);
      }

      if (type === 'digdir' || type === 'all') {
        await this.checkDigDirCompliance(config, result);
      }

      // Calculate overall score
      result.score = this.calculateComplianceScore(result);
      result.compliant =
        result.score >= 80 && result.issues.filter(i => i.severity === 'critical').length === 0;

      // Generate report if requested
      if (report) {
        await this.generateComplianceReport(result, report);
      }

      if (verbose) {
        this.logVerboseResults(result);
      }

      return result;
    } catch (error) {
      logger.error('Compliance check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      result.compliant = false;
      result.issues.push({
        type: 'security',
        severity: 'critical',
        description: 'Compliance check system failure',
        requirement: 'System integrity',
        remediation: 'Fix compliance checker configuration',
      });
      return result;
    }
  }

  private async loadProjectConfig(): Promise<ProjectConfig> {
    const configPaths = ['foundation.config.json', 'package.json', 'tsconfig.json'];

    const config: Record<string, unknown> = {};

    for (const path of configPaths) {
      if (existsSync(path)) {
        try {
          const content = readFileSync(path, 'utf-8');
          config[path.replace('.json', '')] = JSON.parse(content);
        } catch (error) {
          logger.warn(`Failed to load ${path}`, {
            error: error instanceof Error ? error.message : error,
          });
        }
      }
    }

    return config;
  }

  private async checkNSMCompliance(config: ProjectConfig, result: ComplianceResult): Promise<void> {
    const foundationConfig = config['foundation.config'];

    if (!foundationConfig) {
      result.issues.push({
        type: 'nsm',
        severity: 'critical',
        description: 'Missing foundation configuration',
        requirement: 'NSM requires documented security configuration',
        remediation: 'Create foundation.config.json with NSM classification',
      });
      return;
    }

    // Check NSM classification
    const nsmClassification = foundationConfig.compliance?.nsmClassification;
    if (!nsmClassification || !this.nsmClassifications.has(nsmClassification)) {
      result.issues.push({
        type: 'nsm',
        severity: 'critical',
        description: 'Invalid or missing NSM classification',
        requirement: 'All government systems must have NSM classification',
        remediation: 'Set valid NSM classification: ÅPEN, BEGRENSET, KONFIDENSIELT, or HEMMELIG',
      });
    }

    // Check encryption for classified data
    if (nsmClassification !== 'ÅPEN' && !foundationConfig.security?.encryption) {
      result.issues.push({
        type: 'nsm',
        severity: 'high',
        description: 'Missing encryption for classified data',
        requirement: 'NSM requires encryption for BEGRENSET and higher classifications',
        remediation: 'Enable encryption in security configuration',
      });
    }

    // Check access control
    if (nsmClassification !== 'ÅPEN' && !foundationConfig.security?.accessControl) {
      result.issues.push({
        type: 'nsm',
        severity: 'high',
        description: 'Missing access control for classified data',
        requirement: 'NSM requires access control for BEGRENSET and higher classifications',
        remediation: 'Enable access control in security configuration',
      });
    }

    // Check audit trail
    if (!foundationConfig.security?.auditTrail) {
      result.issues.push({
        type: 'nsm',
        severity: 'medium',
        description: 'Missing audit trail configuration',
        requirement: 'NSM recommends audit trails for all government systems',
        remediation: 'Enable audit trail in security configuration',
      });
    }

    // Check logging configuration
    if (!foundationConfig.modules?.logger?.enabled) {
      result.issues.push({
        type: 'nsm',
        severity: 'medium',
        description: 'Missing security logging',
        requirement: 'NSM requires security event logging',
        remediation: 'Enable logger module with security events',
      });
    }
  }

  private async checkGDPRCompliance(
    config: ProjectConfig,
    result: ComplianceResult
  ): Promise<void> {
    const foundationConfig = config['foundation.config'] as FoundationConfig | undefined;

    if (!foundationConfig) {
      result.issues.push({
        type: 'gdpr',
        severity: 'critical',
        description: 'Missing foundation configuration for GDPR',
        requirement: 'GDPR requires documented data protection configuration',
        remediation: 'Create foundation.config.json with GDPR settings',
      });
      return;
    }

    // Check GDPR enablement
    if (!foundationConfig.compliance?.gdprEnabled) {
      result.issues.push({
        type: 'gdpr',
        severity: 'critical',
        description: 'GDPR compliance not enabled',
        requirement: 'GDPR compliance must be explicitly enabled',
        remediation: 'Set gdprEnabled: true in compliance configuration',
      });
    }

    // Check data retention period
    if (!foundationConfig.compliance?.retentionPeriod) {
      result.issues.push({
        type: 'gdpr',
        severity: 'high',
        description: 'Missing data retention period',
        requirement: 'GDPR requires defined data retention periods',
        remediation: 'Set retentionPeriod in compliance configuration (e.g., P7Y)',
      });
    }

    // Check consent management
    if (!foundationConfig.modules?.consentManager?.enabled) {
      result.issues.push({
        type: 'gdpr',
        severity: 'medium',
        description: 'Missing consent management',
        requirement: 'GDPR requires consent management for personal data',
        remediation: 'Enable consent manager module',
      });
    }

    // Check data export capabilities
    if (!foundationConfig.modules?.dataExport?.enabled) {
      result.issues.push({
        type: 'gdpr',
        severity: 'medium',
        description: 'Missing data export capabilities',
        requirement: 'GDPR requires data portability (right to export)',
        remediation: 'Enable data export module',
      });
    }

    // Check data deletion capabilities
    if (!foundationConfig.modules?.dataDeletion?.enabled) {
      result.issues.push({
        type: 'gdpr',
        severity: 'medium',
        description: 'Missing data deletion capabilities',
        requirement: 'GDPR requires right to erasure (right to be forgotten)',
        remediation: 'Enable data deletion module',
      });
    }
  }

  private async checkDigDirCompliance(
    config: ProjectConfig,
    result: ComplianceResult
  ): Promise<void> {
    const foundationConfig = config['foundation.config'] as FoundationConfig | undefined;

    if (!foundationConfig) {
      result.issues.push({
        type: 'digdir',
        severity: 'high',
        description: 'Missing foundation configuration for DigDir',
        requirement: 'DigDir requires documented integration configuration',
        remediation: 'Create foundation.config.json with DigDir settings',
      });
      return;
    }

    // Check DigDir integration
    if (!foundationConfig.norwegian?.digdirIntegration) {
      result.issues.push({
        type: 'digdir',
        severity: 'high',
        description: 'DigDir integration not enabled',
        requirement: 'Norwegian government services should integrate with DigDir',
        remediation: 'Enable digdirIntegration in norwegian configuration',
      });
    }

    // Check ID-porten readiness
    if (!foundationConfig.norwegian?.idPortenReady) {
      result.issues.push({
        type: 'digdir',
        severity: 'medium',
        description: 'ID-porten integration not ready',
        requirement: 'Citizen services should support ID-porten authentication',
        remediation: 'Enable idPortenReady in norwegian configuration',
      });
    }

    // Check municipality code
    if (
      foundationConfig.municipality &&
      !this.norwegianMunicipalities.has(foundationConfig.municipality)
    ) {
      result.issues.push({
        type: 'digdir',
        severity: 'low',
        description: 'Unknown municipality code',
        requirement: 'Use valid Norwegian municipality codes',
        remediation: 'Use valid 4-digit municipality code (e.g., 0301 for Oslo)',
      });
    }

    // Check language support
    const supportedLanguages = foundationConfig.modules?.i18n?.supportedLanguages || [];
    if (!supportedLanguages.includes('nb') && !supportedLanguages.includes('nn')) {
      result.issues.push({
        type: 'digdir',
        severity: 'medium',
        description: 'Missing Norwegian language support',
        requirement: 'Norwegian services should support Norwegian languages',
        remediation: 'Add Norwegian Bokmål (nb) or Nynorsk (nn) to supported languages',
      });
    }

    // Check accessibility features
    if (!foundationConfig.modules?.accessibility?.enabled) {
      result.recommendations.push('Consider enabling accessibility features for WCAG compliance');
    }
  }

  private calculateComplianceScore(result: ComplianceResult): number {
    let score = 100;

    // Deduct points based on issue severity
    for (const issue of result.issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    return Math.max(0, Math.round(score));
  }

  private async generateComplianceReport(
    result: ComplianceResult,
    reportPath: string
  ): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      compliant: result.compliant,
      score: result.score,
      summary: {
        totalIssues: result.issues.length,
        critical: result.issues.filter(i => i.severity === 'critical').length,
        high: result.issues.filter(i => i.severity === 'high').length,
        medium: result.issues.filter(i => i.severity === 'medium').length,
        low: result.issues.filter(i => i.severity === 'low').length,
      },
      issues: result.issues,
      recommendations: result.recommendations,
    };

    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logger.info('Compliance report generated', { reportPath });
  }

  private logVerboseResults(result: ComplianceResult): void {
    logger.info('🇳🇴 Norwegian Compliance Audit Results');
    logger.info(`Overall Compliance Score: ${result.score}/100`);

    logger.info(`Total Issues: ${result.issues.length}`);
    logger.info(`Status: ${result.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`);

    if (result.issues.length > 0) {
      logger.warn('Issues Found:');
      result.issues.forEach(issue => {
        logger.warn(
          `[${issue.type.toUpperCase()}] ${issue.severity.toUpperCase()}: ${issue.description}`
        );
        logger.warn(`Requirement: ${issue.requirement}`);
        logger.warn(`Remediation: ${issue.remediation}`);
        logger.warn('---');
      });
    }

    if (result.recommendations.length > 0) {
      logger.info('Recommendations:');
      result.recommendations.forEach(rec => {
        logger.info(`• ${rec}`);
      });
    }
  }
}

export const complianceChecker = new ComplianceChecker();
