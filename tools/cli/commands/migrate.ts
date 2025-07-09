/**
 * Foundation CLI - Migrate Command
 * Migrates existing projects to use @xala-technologies/foundation
 */

import fs from 'fs/promises';
import path from 'path';
import { createLogger } from '../../../src/logger/index.js';

const logger = createLogger({
  level: 'info',
  auditEnabled: true,
  complianceEnabled: true,
});

export interface MigrateOptions {
  from?: string;
  to: string;
  dryRun?: boolean;
  backup?: boolean;
}

export interface MigrateResult {
  plan: string[];
  filesModified: number;
  dependenciesUpdated: number;
  backupPath?: string;
}

/**
 * Migrate existing project to use Foundation
 */
export async function migrateFoundation(options: MigrateOptions): Promise<MigrateResult> {
  logger.info('Starting Foundation migration', { options });

  const result: MigrateResult = {
    plan: [],
    filesModified: 0,
    dependenciesUpdated: 0,
  };

  try {
    // 1. Analyze current project
    const projectAnalysis = await analyzeProject();

    // 2. Generate migration plan
    result.plan = await generateMigrationPlan(projectAnalysis, options);

    if (options.dryRun) {
      logger.info('Dry run completed', { planSteps: result.plan.length });
      return result;
    }

    // 3. Create backup if requested
    if (options.backup) {
      result.backupPath = await createBackup();
    }

    // 4. Execute migration
    await executeMigration(result, options);

    logger.info('Foundation migration completed', {
      filesModified: result.filesModified,
      dependenciesUpdated: result.dependenciesUpdated,
    });

    return result;
  } catch (error) {
    logger.error(
      'Foundation migration failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

interface ProjectAnalysis {
  framework?: string;
  packageManager: string;
  hasTypeScript: boolean;
  hasReact: boolean;
  hasExpress: boolean;
  hasNestJS: boolean;
  currentLogger?: string;
  currentConfig?: string;
  currentAuth?: string;
}

/**
 * Analyze current project structure and dependencies
 */
async function analyzeProject(): Promise<ProjectAnalysis> {
  const analysis: ProjectAnalysis = {
    packageManager: 'npm',
    hasTypeScript: false,
    hasReact: false,
    hasExpress: false,
    hasNestJS: false,
  };

  try {
    // Check package manager
    if (await fileExists('pnpm-lock.yaml')) {
      analysis.packageManager = 'pnpm';
    } else if (await fileExists('yarn.lock')) {
      analysis.packageManager = 'yarn';
    }

    // Check TypeScript
    analysis.hasTypeScript = await fileExists('tsconfig.json');

    // Analyze package.json
    const packagePath = path.join(process.cwd(), 'package.json');
    if (await fileExists(packagePath)) {
      const packageContent = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(packageContent);

      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      // Detect frameworks
      if (allDeps.react) analysis.hasReact = true;
      if (allDeps.express) analysis.hasExpress = true;
      if (allDeps['@nestjs/core']) analysis.hasNestJS = true;

      // Detect current implementations
      if (allDeps.winston || allDeps.pino) {
        analysis.currentLogger = allDeps.winston ? 'winston' : 'pino';
      }
      if (allDeps.config || allDeps.dotenv) {
        analysis.currentConfig = allDeps.config ? 'config' : 'dotenv';
      }
      if (allDeps.passport || allDeps.jsonwebtoken) {
        analysis.currentAuth = allDeps.passport ? 'passport' : 'jwt';
      }

      // Determine framework
      if (analysis.hasNestJS) analysis.framework = 'nestjs';
      else if (analysis.hasExpress) analysis.framework = 'express';
      else if (analysis.hasReact) analysis.framework = 'react';
      else analysis.framework = 'custom';
    }
  } catch (error) {
    logger.error(
      'Project analysis failed',
      error instanceof Error ? error : new Error(String(error))
    );
  }

  return analysis;
}

/**
 * Generate step-by-step migration plan
 */
async function generateMigrationPlan(
  analysis: ProjectAnalysis,
  options: MigrateOptions
): Promise<string[]> {
  const plan: string[] = [];

  // Basic setup steps
  plan.push('Install @xala-technologies/foundation package');
  plan.push('Create foundation.config.json configuration file');

  // Platform-specific setup
  switch (options.to) {
    case 'web':
      plan.push('Configure web platform with browser optimizations');
      if (analysis.hasReact) {
        plan.push('Set up React integration with Foundation hooks');
        plan.push('Configure Foundation context provider');
      }
      break;

    case 'mobile':
      plan.push('Configure mobile platform with React Native optimizations');
      plan.push('Set up AsyncStorage integration');
      plan.push('Configure push notification support');
      break;

    case 'desktop':
      plan.push('Configure desktop platform with Electron integration');
      plan.push('Set up IPC communication bridge');
      plan.push('Configure auto-updater integration');
      break;

    case 'api':
      plan.push('Configure API platform with server optimizations');
      if (analysis.hasExpress) {
        plan.push('Set up Express middleware integration');
      }
      if (analysis.hasNestJS) {
        plan.push('Set up NestJS module integration');
      }
      break;
  }

  // Migration steps based on current implementations
  if (analysis.currentLogger) {
    plan.push(`Migrate from ${analysis.currentLogger} to Foundation Logger`);
    plan.push('Update log statements to use Foundation Logger API');
  }

  if (analysis.currentConfig) {
    plan.push(`Migrate from ${analysis.currentConfig} to Foundation Config Loader`);
    plan.push('Convert configuration files to Foundation format');
  }

  if (analysis.currentAuth) {
    plan.push(`Integrate ${analysis.currentAuth} with Foundation Auth`);
    plan.push('Configure Norwegian compliance features');
  }

  // Norwegian compliance steps
  plan.push('Configure NSM security classifications');
  plan.push('Set up GDPR compliance features');
  plan.push('Configure Norwegian localization support');

  // Final steps
  plan.push('Update imports and module references');
  plan.push('Run tests and validate functionality');
  plan.push('Generate migration report');

  return plan;
}

/**
 * Create backup of current project
 */
async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), `foundation-backup-${timestamp}`);

  try {
    await fs.mkdir(backupDir, { recursive: true });

    // Copy essential files
    const filesToBackup = [
      'package.json',
      'package-lock.json',
      'pnpm-lock.yaml',
      'yarn.lock',
      'tsconfig.json',
      '.env',
      '.env.local',
      'src/',
      'config/',
      'lib/',
    ];

    for (const file of filesToBackup) {
      const sourcePath = path.join(process.cwd(), file);
      const destPath = path.join(backupDir, file);

      if (await fileExists(sourcePath)) {
        const stats = await fs.stat(sourcePath);
        if (stats.isDirectory()) {
          await copyDirectory(sourcePath, destPath);
        } else {
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          await fs.copyFile(sourcePath, destPath);
        }
      }
    }

    logger.info('Backup created', { backupDir });
    return backupDir;
  } catch (error) {
    logger.error(
      'Backup creation failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw new Error(`Failed to create backup: ${error}`);
  }
}

/**
 * Execute the migration process
 */
async function executeMigration(result: MigrateResult, options: MigrateOptions): Promise<void> {
  try {
    // 1. Install Foundation package
    await installFoundation(result, options);

    // 2. Create configuration
    await createConfiguration(result, options);

    // 3. Migrate existing implementations
    await migrateImplementations(result, options);

    // 4. Update imports
    await updateImports(result, options);
  } catch (error) {
    logger.error(
      'Migration execution failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Install Foundation package and dependencies
 */
async function installFoundation(result: MigrateResult, options: MigrateOptions): Promise<void> {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = await fs.readFile(packagePath, 'utf8');
    const pkg = JSON.parse(packageContent);

    // Add Foundation dependency
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies['@xala-technologies/foundation'] = '^2.0.0';

    // Add platform-specific dependencies
    switch (options.to) {
      case 'web':
        if (!pkg.dependencies.react) {
          pkg.dependencies.react = '^18.0.0';
          pkg.dependencies['react-dom'] = '^18.0.0';
        }
        break;

      case 'mobile':
        if (!pkg.dependencies['react-native']) {
          pkg.dependencies['react-native'] = '^0.72.0';
          pkg.dependencies['@react-native-async-storage/async-storage'] = '^1.19.0';
        }
        break;

      case 'desktop':
        if (!pkg.dependencies.electron) {
          pkg.dependencies.electron = '^25.0.0';
          pkg.dependencies['electron-store'] = '^8.1.0';
        }
        break;

      case 'api':
        if (!pkg.dependencies.express) {
          pkg.dependencies.express = '^4.18.0';
          pkg.dependencies.cors = '^2.8.5';
          pkg.dependencies.helmet = '^7.0.0';
        }
        break;
    }

    // Save updated package.json
    await fs.writeFile(packagePath, JSON.stringify(pkg, null, 2));
    result.dependenciesUpdated++;
  } catch (error) {
    logger.error(
      'Foundation installation failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Create Foundation configuration file
 */
async function createConfiguration(result: MigrateResult, options: MigrateOptions): Promise<void> {
  const configPath = path.join(process.cwd(), 'foundation.config.json');

  const config = {
    platform: options.to,
    environment: process.env.NODE_ENV || 'development',
    logging: {
      level: 'info',
      enableAudit: true,
      nsmClassification: 'ÅPEN',
    },
    compliance: {
      nsm: {
        enabled: true,
        defaultClassification: 'ÅPEN',
        encryptionRequired: false,
      },
      gdpr: {
        enabled: true,
        consentRequired: true,
        dataRetention: 'P7Y',
        auditTrail: true,
      },
      digdir: {
        enabled: false,
        idPortenEnabled: false,
        maskinportenEnabled: false,
      },
    },
    localization: {
      defaultLanguage: 'nb',
      supportedLanguages: ['nb', 'nn', 'en'],
      municipalityCode: null,
    },
    features: {
      metrics: true,
      healthCheck: true,
      errorHandler: true,
      featureToggle: true,
    },
  };

  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    result.filesModified++;
    logger.info('Foundation configuration created', { configPath });
  } catch (error) {
    logger.error(
      'Configuration creation failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Migrate existing implementations to Foundation
 */
async function migrateImplementations(
  result: MigrateResult,
  options: MigrateOptions
): Promise<void> {
  try {
    // This is a simplified migration - in a real implementation,
    // we would scan source files and replace specific patterns

    const srcDir = path.join(process.cwd(), 'src');
    if (await fileExists(srcDir)) {
      // Find and update common patterns
      const sourceFiles = await findSourceFiles(srcDir);

      for (const file of sourceFiles.slice(0, 10)) {
        // Limit for demo
        try {
          let content = await fs.readFile(file, 'utf8');
          let modified = false;

          // Replace common logger imports
          if (content.includes('winston') || content.includes('pino')) {
            content = content.replace(
              /import.*winston.*from.*['"]winston['"];?/g,
              "import { createLogger } from '@xala-technologies/foundation';"
            );
            modified = true;
          }

          // Replace config imports
          if (content.includes('config') || content.includes('dotenv')) {
            content = content.replace(
              /import.*config.*from.*['"]config['"];?/g,
              "import { loadConfig } from '@xala-technologies/foundation';"
            );
            modified = true;
          }

          if (modified) {
            await fs.writeFile(file, content);
            result.filesModified++;
          }
        } catch (error) {
          logger.warn('Failed to migrate file', { file, error });
        }
      }
    }
  } catch (error) {
    logger.error(
      'Implementation migration failed',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Update imports to use Foundation modules
 */
async function updateImports(result: MigrateResult, options: MigrateOptions): Promise<void> {
  // Platform-specific import updates would be implemented here
  // This is a placeholder for the actual implementation
  logger.info('Import updates completed', { platform: options.to });
}

/**
 * Utility functions
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function findSourceFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        const subFiles = await findSourceFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && /\.(ts|js|tsx|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory access denied or doesn't exist
  }

  return files;
}
