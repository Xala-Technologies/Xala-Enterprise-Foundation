#!/usr/bin/env node
import { Command } from 'commander';
import { createLogger } from '../../src/logger/index.js';
import { complianceChecker } from '../compliance/index.js';
import { validateConfiguration } from '../validators/config-validator.js';
import { analyzeFoundation } from './commands/analyze.js';
import { auditFoundation } from './commands/audit.js';
import { migrateFoundation } from './commands/migrate.js';
import { setupFoundation } from './commands/setup.js';
import { packageInfo } from './package-info.js';

const logger = createLogger({
  level: 'info',
  auditEnabled: true,
  complianceEnabled: true,
});

const program = new Command();

program
  .name('foundation-cli')
  .description('CLI tool for @xala-technologies/foundation - Norwegian government compliant')
  .version(packageInfo.version);

// Setup command - Initialize foundation in a project
program
  .command('setup')
  .description('Initialize @xala-technologies/foundation in a project')
  .option('-p, --platform <platform>', 'Target platform (web, mobile, desktop, api)', 'web')
  .option('-m, --municipality <code>', 'Norwegian municipality code (e.g., 0301 for Oslo)')
  .option('-l, --language <lang>', 'Language code (nb, nn, en)', 'nb')
  .option(
    '-c, --compliance <level>',
    'NSM classification level (ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG)',
    'ÅPEN'
  )
  .option('-d, --dry-run', 'Show what would be done without making changes')
  .action(async options => {
    try {
      logger.info('Starting foundation setup', { options });
      await setupFoundation(options);
      logger.info('Foundation setup completed successfully');
    } catch (error) {
      logger.error(
        'Foundation setup failed',
        error instanceof Error ? error : new Error(String(error))
      );
      process.exit(1);
    }
  });

// Validate command - Check configuration compliance
program
  .command('validate')
  .description('Validate foundation configuration for Norwegian compliance')
  .option('-c, --config <path>', 'Path to configuration file', './foundation.config.json')
  .option('-s, --strict', 'Enable strict validation mode')
  .option('-f, --format <format>', 'Output format (json, table, detailed)', 'table')
  .action(async options => {
    try {
      logger.info('Starting configuration validation', { options });
      const result = await validateConfiguration(options.config, {
        strict: options.strict,
        format: options.format,
      });

      if (result.valid) {
        logger.info('Configuration validation passed', { score: result.score });
        console.log('✅ Configuration is valid and compliant');
      } else {
        logger.warn('Configuration validation failed', { errors: result.errors });
        console.log('❌ Configuration validation failed');
        result.errors.forEach(error => console.log(`  - ${error}`));
        process.exit(1);
      }
    } catch (error) {
      logger.error(
        'Configuration validation error',
        error instanceof Error ? error : new Error(String(error))
      );
      process.exit(1);
    }
  });

// Compliance command - Check Norwegian government compliance
program
  .command('compliance')
  .description('Check project compliance with Norwegian government standards')
  .option('-t, --type <type>', 'Compliance type (nsm, gdpr, digdir, all)', 'all')
  .option('-r, --report <path>', 'Generate compliance report to file')
  .option('-v, --verbose', 'Verbose output with detailed explanations')
  .action(async options => {
    try {
      logger.info('Starting compliance check', { options });
      const result = await complianceChecker.check(options);

      if (result.compliant) {
        logger.info('Compliance check passed', { score: result.score });
        console.log('✅ Project is compliant with Norwegian government standards');
      } else {
        logger.warn('Compliance check failed', { issues: result.issues });
        console.log('❌ Compliance issues found');
        result.issues.forEach(issue => console.log(`  - ${issue.description}`));
        process.exit(1);
      }
    } catch (error) {
      logger.error(
        'Compliance check error',
        error instanceof Error ? error : new Error(String(error))
      );
      process.exit(1);
    }
  });

// Analyze command - Analyze foundation usage and performance
program
  .command('analyze')
  .description('Analyze foundation usage and performance in project')
  .option('-d, --directory <path>', 'Project directory to analyze', '.')
  .option('-o, --output <path>', 'Output analysis report to file')
  .option('-m, --metrics', 'Include performance metrics')
  .action(async options => {
    try {
      logger.info('Starting foundation analysis', { options });
      const result = await analyzeFoundation(options);

      console.log('📊 Foundation Analysis Report');
      console.log(`   Modules Used: ${result.modulesUsed.join(', ')}`);
      console.log(`   Compliance Score: ${result.complianceScore}/100`);
      console.log(`   Performance Score: ${result.performanceScore}/100`);

      if (options.output) {
        await result.saveReport(options.output);
        console.log(`   Report saved to: ${options.output}`);
      }
    } catch (error) {
      logger.error(
        'Foundation analysis error',
        error instanceof Error ? error : new Error(String(error))
      );
      process.exit(1);
    }
  });

// Audit command - Generate audit trails and security reports
program
  .command('audit')
  .description('Generate audit trails and security reports')
  .option('-p, --period <period>', 'Audit period (1d, 7d, 30d, 1y)', '30d')
  .option('-t, --type <type>', 'Audit type (security, compliance, performance, all)', 'all')
  .option('-o, --output <path>', 'Output audit report to file')
  .option('-e, --export <format>', 'Export format (json, csv, pdf)', 'json')
  .action(async options => {
    try {
      logger.info('Starting audit generation', { options });
      const result = await auditFoundation(options);

      console.log('📋 Audit Report Generated');
      console.log(`   Period: ${options.period}`);
      console.log(`   Events Audited: ${result.eventsCount}`);
      console.log(`   Security Issues: ${result.securityIssues}`);
      console.log(`   Compliance Score: ${result.complianceScore}/100`);

      if (options.output) {
        await result.saveReport(options.output, options.export);
        console.log(`   Report saved to: ${options.output}`);
      }
    } catch (error) {
      logger.error(
        'Audit generation error',
        error instanceof Error ? error : new Error(String(error))
      );
      process.exit(1);
    }
  });

// Migrate command - Migrate existing projects to foundation
program
  .command('migrate')
  .description('Migrate existing project to use @xala-technologies/foundation')
  .option('-f, --from <framework>', 'Source framework (express, nestjs, fastify, custom)')
  .option('-t, --to <platform>', 'Target platform (web, mobile, desktop, api)', 'web')
  .option('-d, --dry-run', 'Show migration plan without making changes')
  .option('-b, --backup', 'Create backup before migration')
  .action(async options => {
    try {
      logger.info('Starting migration process', { options });
      const result = await migrateFoundation(options);

      if (options.dryRun) {
        console.log('📋 Migration Plan');
        result.plan.forEach(step => console.log(`   - ${step}`));
      } else {
        console.log('🔄 Migration completed successfully');
        console.log(`   Files modified: ${result.filesModified}`);
        console.log(`   Dependencies updated: ${result.dependenciesUpdated}`);
      }
    } catch (error) {
      logger.error('Migration error', error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  });

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', new Error(String(reason)), { promise });
  process.exit(1);
});

process.on('uncaughtException', error => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

// Execute CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}
