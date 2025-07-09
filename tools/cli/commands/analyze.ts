import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { createLogger } from '../../../src/logger/index.js';

const logger = createLogger({
  level: 'info',
  auditEnabled: true,
  complianceEnabled: true,
});

export interface AnalyzeOptions {
  directory: string;
  output?: string;
  metrics?: boolean;
}

export interface AnalysisResult {
  modulesUsed: string[];
  complianceScore: number;
  performanceScore: number;
  recommendations: string[];
  metrics: {
    totalFiles: number;
    foundationImports: number;
    codeComplexity: number;
    testCoverage: number;
  };
  saveReport: (path: string) => Promise<void>;
}

export async function analyzeFoundation(options: AnalyzeOptions): Promise<AnalysisResult> {
  const { directory, output, metrics = false } = options;

  logger.info('Starting foundation analysis', { directory, metrics });

  const result: AnalysisResult = {
    modulesUsed: [],
    complianceScore: 0,
    performanceScore: 0,
    recommendations: [],
    metrics: {
      totalFiles: 0,
      foundationImports: 0,
      codeComplexity: 0,
      testCoverage: 0,
    },
    saveReport: async (path: string) => {
      const report = {
        timestamp: new Date().toISOString(),
        directory,
        analysis: {
          modulesUsed: result.modulesUsed,
          complianceScore: result.complianceScore,
          performanceScore: result.performanceScore,
          recommendations: result.recommendations,
          metrics: result.metrics,
        },
      };
      writeFileSync(path, JSON.stringify(report, null, 2));
      logger.info('Analysis report saved', { path });
    },
  };

  try {
    // Scan project files
    const files = await scanProjectFiles(directory);
    result.metrics.totalFiles = files.length;

    // Analyze foundation usage
    const foundationUsage = await analyzeFoundationUsage(files);
    result.modulesUsed = foundationUsage.modules;
    result.metrics.foundationImports = foundationUsage.imports;

    // Calculate compliance score
    result.complianceScore = await calculateComplianceScore(directory, foundationUsage);

    // Calculate performance score
    result.performanceScore = await calculatePerformanceScore(files, foundationUsage);

    // Generate recommendations
    result.recommendations = generateRecommendations(foundationUsage, result);

    // Collect metrics if requested
    if (metrics) {
      result.metrics.codeComplexity = await calculateCodeComplexity(files);
      result.metrics.testCoverage = await calculateTestCoverage(directory);
    }

    return result;
  } catch (error) {
    logger.error('Foundation analysis failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function scanProjectFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  function scanDirectory(dir: string): void {
    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules and other common directories
          if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry)) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile() && extensions.includes(extname(entry))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      logger.warn('Failed to scan directory', {
        directory: dir,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  scanDirectory(directory);
  return files;
}

async function analyzeFoundationUsage(
  files: string[]
): Promise<{ modules: string[]; imports: number }> {
  const foundationModules = new Set<string>();
  let importCount = 0;

  const modulePatterns = [
    /from ['"]@xala-technologies\/foundation['"]/, // Core foundation
    /from ['"]@xala-technologies\/foundation\/web['"]/, // Web platform
    /from ['"]@xala-technologies\/foundation\/mobile['"]/, // Mobile platform
    /from ['"]@xala-technologies\/foundation\/desktop['"]/, // Desktop platform
    /from ['"]@xala-technologies\/foundation\/api['"]/, // API platform
    /createLogger/, // Logger module
    /FoundationErrorHandler/, // Error handler
    /FeatureToggleManager/, // Feature toggle
    /I18nManager/, // i18n
    /FoundationHealthCheck/, // Health check
    /MetricsSDK/, // Metrics
    /SagaOrchestrator/, // Saga orchestrator
    /EventPublisher/, // Event publisher
    /EventSubscriber/, // Event subscriber
  ];

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');

      // Check for foundation imports
      for (const pattern of modulePatterns) {
        if (pattern.test(content)) {
          importCount++;

          // Extract module name from pattern
          const match = pattern.source.match(/([A-Z][a-zA-Z]+)|([a-z-]+)/);
          if (match) {
            foundationModules.add(match[0]);
          }
        }
      }

      // Check for specific module usage
      if (content.includes('createLogger')) foundationModules.add('logger');
      if (content.includes('FoundationErrorHandler')) foundationModules.add('error-handler');
      if (content.includes('FeatureToggleManager')) foundationModules.add('feature-toggle');
      if (content.includes('I18nManager')) foundationModules.add('i18n-core');
      if (content.includes('FoundationHealthCheck')) foundationModules.add('healthcheck');
      if (content.includes('MetricsSDK')) foundationModules.add('metrics-sdk');
      if (content.includes('SagaOrchestrator')) foundationModules.add('saga-orchestrator');
      if (content.includes('EventPublisher')) foundationModules.add('event-publisher');
      if (content.includes('EventSubscriber')) foundationModules.add('event-subscriber');
    } catch (error) {
      logger.warn('Failed to analyze file', {
        file,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    modules: Array.from(foundationModules),
    imports: importCount,
  };
}

async function calculateComplianceScore(
  directory: string,
  usage: { modules: string[]; imports: number }
): Promise<number> {
  let score = 0;

  // Check for configuration files
  const configFiles = ['foundation.config.json', 'package.json'];
  for (const configFile of configFiles) {
    if (existsSync(join(directory, configFile))) {
      score += 20;
    }
  }

  // Check for required modules
  const requiredModules = ['logger', 'error-handler', 'healthcheck'];
  for (const module of requiredModules) {
    if (usage.modules.includes(module)) {
      score += 10;
    }
  }

  // Check for compliance modules
  const complianceModules = ['i18n-core', 'metrics-sdk'];
  for (const module of complianceModules) {
    if (usage.modules.includes(module)) {
      score += 5;
    }
  }

  // Check for Norwegian compliance
  try {
    const configPath = join(directory, 'foundation.config.json');
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      if (config.compliance?.gdprEnabled) score += 10;
      if (config.compliance?.nsmClassification) score += 10;
      if (config.norwegian?.municipality) score += 5;
    }
  } catch (error) {
    logger.warn('Failed to check compliance configuration', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return Math.min(100, score);
}

async function calculatePerformanceScore(
  files: string[],
  usage: { modules: string[]; imports: number }
): Promise<number> {
  let score = 100;

  // Deduct for excessive imports
  if (usage.imports > 50) {
    score -= 20;
  } else if (usage.imports > 30) {
    score -= 10;
  }

  // Deduct for large files
  let largeFiles = 0;
  for (const file of files) {
    try {
      const stat = statSync(file);
      if (stat.size > 50000) {
        // 50KB
        largeFiles++;
      }
    } catch (error) {
      // Ignore file stat errors
    }
  }

  if (largeFiles > 10) {
    score -= 30;
  } else if (largeFiles > 5) {
    score -= 15;
  }

  // Bonus for using performance-oriented modules
  if (usage.modules.includes('metrics-sdk')) score += 10;
  if (usage.modules.includes('healthcheck')) score += 10;

  return Math.max(0, score);
}

async function calculateCodeComplexity(files: string[]): Promise<number> {
  let totalComplexity = 0;

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');

      // Simple complexity calculation based on control structures
      const ifCount = (content.match(/\bif\b/g) || []).length;
      const forCount = (content.match(/\bfor\b/g) || []).length;
      const whileCount = (content.match(/\bwhile\b/g) || []).length;
      const switchCount = (content.match(/\bswitch\b/g) || []).length;
      const catchCount = (content.match(/\bcatch\b/g) || []).length;

      totalComplexity += ifCount + forCount + whileCount + switchCount + catchCount;
    } catch (error) {
      // Ignore file reading errors
    }
  }

  return totalComplexity;
}

async function calculateTestCoverage(directory: string): Promise<number> {
  try {
    // Look for test files
    const testFiles = await scanProjectFiles(directory);
    const testFileCount = testFiles.filter(
      file => file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__')
    ).length;

    const totalFiles = testFiles.length;

    if (totalFiles === 0) return 0;

    return Math.round((testFileCount / totalFiles) * 100);
  } catch (error) {
    logger.warn('Failed to calculate test coverage', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

function generateRecommendations(
  usage: { modules: string[]; imports: number },
  result: AnalysisResult
): string[] {
  const recommendations: string[] = [];

  // Check for missing required modules
  const requiredModules = ['logger', 'error-handler', 'healthcheck'];
  for (const module of requiredModules) {
    if (!usage.modules.includes(module)) {
      recommendations.push(`Consider adding ${module} module for better reliability`);
    }
  }

  // Check for compliance modules
  if (!usage.modules.includes('i18n-core')) {
    recommendations.push('Add i18n-core module for Norwegian language support');
  }

  if (!usage.modules.includes('metrics-sdk')) {
    recommendations.push('Add metrics-sdk module for performance monitoring');
  }

  // Performance recommendations
  if (result.performanceScore < 70) {
    recommendations.push('Consider optimizing code structure to improve performance score');
  }

  if (usage.imports > 30) {
    recommendations.push('Consider consolidating foundation imports to reduce bundle size');
  }

  // Compliance recommendations
  if (result.complianceScore < 80) {
    recommendations.push('Add foundation.config.json with Norwegian compliance settings');
    recommendations.push('Enable GDPR compliance and NSM classification');
  }

  // Testing recommendations
  if (result.metrics.testCoverage < 50) {
    recommendations.push('Increase test coverage for better code quality');
  }

  return recommendations;
}
