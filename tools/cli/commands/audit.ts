/**
 * Foundation CLI - Audit Command
 * Generates audit trails and security reports for Norwegian government compliance
 */

import fs from 'fs/promises';
import path from 'path';
import { createLogger } from '../../../src/logger/index.js';

const logger = createLogger({
  level: 'info',
  auditEnabled: true,
  complianceEnabled: true,
});

export interface AuditOptions {
  period: string;
  type: 'security' | 'compliance' | 'performance' | 'all';
  output?: string;
  export: 'json' | 'csv' | 'pdf';
}

export interface AuditResult {
  eventsCount: number;
  securityIssues: number;
  complianceScore: number;
  timestamp: string;
  period: string;
  findings: AuditFinding[];
  saveReport: (outputPath: string, format: string) => Promise<void>;
}

interface AuditFinding {
  id: string;
  type: 'security' | 'compliance' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  nsmClassification?: string;
  gdprRelevant: boolean;
}

/**
 * Generate comprehensive audit report for Foundation usage
 */
export async function auditFoundation(options: AuditOptions): Promise<AuditResult> {
  logger.info('Starting Foundation audit', { options });

  const auditResult: AuditResult = {
    eventsCount: 0,
    securityIssues: 0,
    complianceScore: 0,
    timestamp: new Date().toISOString(),
    period: options.period,
    findings: [],
    saveReport: async (outputPath: string, format: string) => {
      await saveAuditReport(auditResult, outputPath, format);
    },
  };

  try {
    // 1. Audit Foundation configuration
    await auditConfiguration(auditResult);

    // 2. Audit security implementations
    if (options.type === 'security' || options.type === 'all') {
      await auditSecurity(auditResult);
    }

    // 3. Audit Norwegian compliance
    if (options.type === 'compliance' || options.type === 'all') {
      await auditCompliance(auditResult);
    }

    // 4. Audit performance metrics
    if (options.type === 'performance' || options.type === 'all') {
      await auditPerformance(auditResult);
    }

    // 5. Calculate overall compliance score
    auditResult.complianceScore = calculateComplianceScore(auditResult.findings);
    auditResult.securityIssues = auditResult.findings.filter(
      f => f.type === 'security' && f.severity !== 'low'
    ).length;

    logger.info('Foundation audit completed', {
      eventsCount: auditResult.eventsCount,
      securityIssues: auditResult.securityIssues,
      complianceScore: auditResult.complianceScore,
    });

    return auditResult;
  } catch (error) {
    logger.error(
      'Foundation audit failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Audit Foundation configuration for compliance
 */
async function auditConfiguration(result: AuditResult): Promise<void> {
  try {
    const configPath = path.join(process.cwd(), 'foundation.config.json');

    try {
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);

      // Check NSM classification
      if (!config.nsm?.classification) {
        result.findings.push({
          id: 'CONFIG_001',
          type: 'compliance',
          severity: 'high',
          title: 'Missing NSM Classification',
          description: 'NSM security classification is not configured',
          recommendation: 'Configure NSM classification in foundation.config.json',
          nsmClassification: 'BEGRENSET',
          gdprRelevant: false,
        });
      }

      // Check GDPR configuration
      if (!config.gdpr?.enabled) {
        result.findings.push({
          id: 'CONFIG_002',
          type: 'compliance',
          severity: 'critical',
          title: 'GDPR Not Enabled',
          description: 'GDPR compliance features are not enabled',
          recommendation: 'Enable GDPR compliance in foundation.config.json',
          gdprRelevant: true,
        });
      }

      result.eventsCount += 2;
    } catch (error) {
      result.findings.push({
        id: 'CONFIG_003',
        type: 'compliance',
        severity: 'medium',
        title: 'Missing Configuration File',
        description: 'foundation.config.json not found',
        recommendation: 'Create foundation.config.json using foundation-cli setup',
        gdprRelevant: false,
      });
    }
  } catch (error) {
    logger.error(
      'Configuration audit failed',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Audit security implementations
 */
async function auditSecurity(result: AuditResult): Promise<void> {
  try {
    // Check for security-related files and implementations
    const securityFiles = ['src/security', 'platforms/*/security', 'tools/security'];

    for (const pattern of securityFiles) {
      try {
        await fs.access(pattern);
        result.eventsCount++;
      } catch {
        result.findings.push({
          id: `SEC_${securityFiles.indexOf(pattern) + 1}`,
          type: 'security',
          severity: 'medium',
          title: `Missing Security Implementation`,
          description: `Security module not found at ${pattern}`,
          recommendation: 'Implement security modules for enhanced protection',
          nsmClassification: 'BEGRENSET',
          gdprRelevant: true,
        });
      }
    }

    // Check package.json for security dependencies
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(packageContent);

      const securityDeps = ['helmet', 'cors', 'bcrypt', 'jsonwebtoken'];
      const missingDeps = securityDeps.filter(
        dep => !pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]
      );

      if (missingDeps.length > 0) {
        result.findings.push({
          id: 'SEC_DEPS',
          type: 'security',
          severity: 'medium',
          title: 'Missing Security Dependencies',
          description: `Missing security dependencies: ${missingDeps.join(', ')}`,
          recommendation: 'Install recommended security dependencies',
          gdprRelevant: false,
        });
      }

      result.eventsCount++;
    } catch (error) {
      logger.error('Package.json security audit failed', { error });
    }
  } catch (error) {
    logger.error('Security audit failed', { error });
  }
}

/**
 * Audit Norwegian government compliance
 */
async function auditCompliance(result: AuditResult): Promise<void> {
  try {
    // Check for Norwegian compliance implementations
    const complianceChecks = [
      {
        check: 'NSM Classification Support',
        pattern: /nsm|NSM|classification/g,
        severity: 'high' as const,
      },
      {
        check: 'GDPR Implementation',
        pattern: /gdpr|GDPR|consent|privacy/g,
        severity: 'critical' as const,
      },
      {
        check: 'DigDir Integration',
        pattern: /digdir|DigDir|id-porten/g,
        severity: 'medium' as const,
      },
      {
        check: 'Norwegian Language Support',
        pattern: /norwegian|norsk|bokmål|nynorsk/g,
        severity: 'low' as const,
      },
    ];

    for (const check of complianceChecks) {
      let found = false;

      try {
        // Check source files for compliance patterns
        const srcFiles = await findFilesWithPattern(process.cwd(), /\.(ts|js|json)$/);

        for (const file of srcFiles.slice(0, 10)) {
          // Limit for performance
          try {
            const content = await fs.readFile(file, 'utf8');
            if (check.pattern.test(content)) {
              found = true;
              break;
            }
          } catch {
            continue;
          }
        }

        if (!found) {
          result.findings.push({
            id: `COMP_${complianceChecks.indexOf(check) + 1}`,
            type: 'compliance',
            severity: check.severity,
            title: `Missing ${check.check}`,
            description: `No implementation found for ${check.check}`,
            recommendation: `Implement ${check.check} using Foundation modules`,
            nsmClassification: 'ÅPEN',
            gdprRelevant: check.check.includes('GDPR'),
          });
        }

        result.eventsCount++;
      } catch (error) {
        logger.error(`Compliance check failed for ${check.check}`, { error });
      }
    }
  } catch (error) {
    logger.error('Compliance audit failed', { error });
  }
}

/**
 * Audit performance metrics
 */
async function auditPerformance(result: AuditResult): Promise<void> {
  try {
    // Check for performance monitoring implementations
    const performanceIndicators = ['metrics', 'monitoring', 'performance', 'benchmark'];

    let performanceScore = 0;

    for (const indicator of performanceIndicators) {
      try {
        const files = await findFilesWithPattern(process.cwd(), new RegExp(indicator, 'i'));
        if (files.length > 0) {
          performanceScore += 25;
        }
      } catch {
        continue;
      }
    }

    if (performanceScore < 50) {
      result.findings.push({
        id: 'PERF_001',
        type: 'performance',
        severity: 'medium',
        title: 'Limited Performance Monitoring',
        description: `Performance monitoring score: ${performanceScore}/100`,
        recommendation: 'Implement comprehensive performance monitoring using Foundation metrics',
        gdprRelevant: false,
      });
    }

    result.eventsCount++;
  } catch (error) {
    logger.error('Performance audit failed', { error });
  }
}

/**
 * Calculate overall compliance score based on findings
 */
function calculateComplianceScore(findings: AuditFinding[]): number {
  const severityWeights = {
    low: 5,
    medium: 15,
    high: 30,
    critical: 50,
  };

  const totalDeductions = findings.reduce((sum, finding) => {
    return sum + severityWeights[finding.severity];
  }, 0);

  return Math.max(0, 100 - totalDeductions);
}

/**
 * Find files matching a pattern
 */
async function findFilesWithPattern(dir: string, pattern: RegExp): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        const subFiles = await findFilesWithPattern(fullPath, pattern);
        files.push(...subFiles);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory access denied or doesn't exist
  }

  return files;
}

/**
 * Save audit report in specified format
 */
async function saveAuditReport(
  result: AuditResult,
  outputPath: string,
  format: string
): Promise<void> {
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  switch (format) {
    case 'json':
      await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
      break;

    case 'csv':
      const csvContent = [
        'ID,Type,Severity,Title,Description,Recommendation,NSM Classification,GDPR Relevant',
        ...result.findings.map(
          f =>
            `"${f.id}","${f.type}","${f.severity}","${f.title}","${f.description}","${f.recommendation}","${f.nsmClassification || ''}","${f.gdprRelevant}"`
        ),
      ].join('\n');
      await fs.writeFile(outputPath, csvContent);
      break;

    case 'pdf':
      // For PDF generation, we'll create a detailed text report
      const textReport = generateTextReport(result);
      await fs.writeFile(outputPath.replace('.pdf', '.txt'), textReport);
      logger.info('PDF format not implemented, saved as text report instead');
      break;

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  logger.info('Audit report saved', { outputPath, format });
}

/**
 * Generate detailed text report
 */
function generateTextReport(result: AuditResult): string {
  const lines = [
    '# Foundation Audit Report',
    '',
    `**Timestamp:** ${result.timestamp}`,
    `**Period:** ${result.period}`,
    `**Events Audited:** ${result.eventsCount}`,
    `**Security Issues:** ${result.securityIssues}`,
    `**Compliance Score:** ${result.complianceScore}/100`,
    '',
    '## Findings',
    '',
  ];

  for (const finding of result.findings) {
    lines.push(`### ${finding.title} (${finding.severity.toUpperCase()})`);
    lines.push(`**ID:** ${finding.id}`);
    lines.push(`**Type:** ${finding.type}`);
    lines.push(`**Description:** ${finding.description}`);
    lines.push(`**Recommendation:** ${finding.recommendation}`);
    if (finding.nsmClassification) {
      lines.push(`**NSM Classification:** ${finding.nsmClassification}`);
    }
    lines.push(`**GDPR Relevant:** ${finding.gdprRelevant ? 'Yes' : 'No'}`);
    lines.push('');
  }

  return lines.join('\n');
}
