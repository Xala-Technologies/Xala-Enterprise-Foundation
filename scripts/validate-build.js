#!/usr/bin/env node

/**
 * Build Validation Script for Foundation Package
 * Validates all platform builds, bundle sizes, and integration tests
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class BuildValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.distPath = path.join(process.cwd(), 'dist');
  }

  log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
    };
    console.log(colors[type](`[${type.toUpperCase()}] ${message}`));
  }

  validateFileExists(filePath, description) {
    const fullPath = path.join(this.distPath, filePath);
    if (!fs.existsSync(fullPath)) {
      this.errors.push(`Missing ${description}: ${filePath}`);
      return false;
    }
    this.log(`✓ ${description} exists: ${filePath}`, 'success');
    return true;
  }

  validateFileSize(filePath, maxSizeKB, description) {
    const fullPath = path.join(this.distPath, filePath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }

    const stats = fs.statSync(fullPath);
    const sizeKB = stats.size / 1024;

    if (sizeKB > maxSizeKB) {
      this.warnings.push(
        `${description} size ${sizeKB.toFixed(2)}KB exceeds ${maxSizeKB}KB: ${filePath}`
      );
    } else {
      this.log(
        `✓ ${description} size ${sizeKB.toFixed(2)}KB is within ${maxSizeKB}KB limit`,
        'success'
      );
    }

    return true;
  }

  validateCoreFiles() {
    this.log('Validating core Foundation files...', 'info');

    // Core entry points
    this.validateFileExists('index.js', 'Core CJS bundle');
    this.validateFileExists('index.esm.js', 'Core ESM bundle');
    this.validateFileExists('index.umd.js', 'Core UMD bundle');
    this.validateFileExists('index.d.ts', 'Core TypeScript declarations');

    // Core bundle size validation
    this.validateFileSize('index.js', 50, 'Core CJS bundle');
    this.validateFileSize('index.esm.js', 50, 'Core ESM bundle');
    this.validateFileSize('index.umd.js', 60, 'Core UMD bundle');
  }

  validatePlatformFiles() {
    this.log('Validating platform-specific files...', 'info');

    const platforms = ['web', 'mobile', 'desktop', 'api'];
    const maxSizes = { web: 25, mobile: 30, desktop: 35, api: 40 };

    platforms.forEach(platform => {
      this.log(`Validating ${platform} platform...`, 'info');

      // Platform entry points
      this.validateFileExists(`platforms/${platform}/index.js`, `${platform} CJS bundle`);
      this.validateFileExists(`platforms/${platform}/index.esm.js`, `${platform} ESM bundle`);
      this.validateFileExists(
        `platforms/${platform}/index.d.ts`,
        `${platform} TypeScript declarations`
      );

      // Platform bundle sizes
      this.validateFileSize(
        `platforms/${platform}/index.js`,
        maxSizes[platform],
        `${platform} CJS bundle`
      );
      this.validateFileSize(
        `platforms/${platform}/index.esm.js`,
        maxSizes[platform],
        `${platform} ESM bundle`
      );
    });
  }

  validateToolsFiles() {
    this.log('Validating CLI tools...', 'info');

    // CLI tools
    this.validateFileExists('tools/cli/index.js', 'CLI tools bundle');
    this.validateFileExists('tools/cli/index.d.ts', 'CLI TypeScript declarations');

    // CLI bundle size
    this.validateFileSize('tools/cli/index.js', 100, 'CLI tools bundle');
  }

  validateImports() {
    this.log('Validating import functionality...', 'info');

    try {
      // Test core imports
      const core = require(path.join(this.distPath, 'index.js'));
      if (!core.FoundationLogger || !core.FoundationFeatureToggle) {
        this.errors.push('Core exports not found in bundle');
      } else {
        this.log('✓ Core imports working correctly', 'success');
      }

      // Test platform imports
      const platforms = ['web', 'mobile', 'desktop', 'api'];
      platforms.forEach(platform => {
        try {
          const platformModule = require(
            path.join(this.distPath, `platforms/${platform}/index.js`)
          );
          if (
            !platformModule[
              `Foundation${platform.charAt(0).toUpperCase() + platform.slice(1)}Setup`
            ]
          ) {
            this.warnings.push(`${platform} platform setup not found in bundle`);
          } else {
            this.log(`✓ ${platform} platform imports working correctly`, 'success');
          }
        } catch (error) {
          this.errors.push(`Failed to import ${platform} platform: ${error.message}`);
        }
      });
    } catch (error) {
      this.errors.push(`Failed to test imports: ${error.message}`);
    }
  }

  validatePackageJson() {
    this.log('Validating package.json exports...', 'info');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check main entry points
    if (!packageJson.main || !packageJson.module) {
      this.errors.push('Missing main or module entry points in package.json');
    }

    // Check exports configuration
    if (!packageJson.exports || !packageJson.exports['.']) {
      this.errors.push('Missing exports configuration in package.json');
    }

    // Check platform exports
    const platforms = ['web', 'mobile', 'desktop', 'api'];
    platforms.forEach(platform => {
      const exportKey = `./${platform}`;
      if (!packageJson.exports[exportKey]) {
        this.warnings.push(`Missing export configuration for ${platform} platform`);
      }
    });

    this.log('✓ Package.json validation completed', 'success');
  }

  validateTypeScript() {
    this.log('Validating TypeScript declarations...', 'info');

    try {
      // Run TypeScript compiler check on declarations
      execSync('npx tsc --noEmit --skipLibCheck dist/index.d.ts', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });
      this.log('✓ TypeScript declarations are valid', 'success');
    } catch (error) {
      this.errors.push(`TypeScript declaration validation failed: ${error.message}`);
    }
  }

  validateNorwegianCompliance() {
    this.log('Validating Norwegian compliance features...', 'info');

    try {
      const core = require(path.join(this.distPath, 'index.js'));

      // Check NSM classification support
      if (!core.FoundationNSM) {
        this.errors.push('NSM classification module not found in core bundle');
      }

      // Check GDPR compliance support
      if (!core.FoundationGDPR) {
        this.warnings.push('GDPR compliance module not found in core bundle');
      }

      // Check Norwegian localization
      const webPlatform = require(path.join(this.distPath, 'platforms/web/index.js'));
      if (!webPlatform.FoundationNorwegianDesign) {
        this.warnings.push('Norwegian design system not found in web platform');
      }

      this.log('✓ Norwegian compliance features validated', 'success');
    } catch (error) {
      this.errors.push(`Failed to validate Norwegian compliance: ${error.message}`);
    }
  }

  generateReport() {
    this.log('\n=== BUILD VALIDATION REPORT ===', 'info');

    if (this.errors.length === 0) {
      this.log('✅ BUILD VALIDATION PASSED', 'success');
    } else {
      this.log('❌ BUILD VALIDATION FAILED', 'error');
      this.errors.forEach(error => this.log(`  • ${error}`, 'error'));
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️  WARNINGS:', 'warning');
      this.warnings.forEach(warning => this.log(`  • ${warning}`, 'warning'));
    }

    this.log(`\nErrors: ${this.errors.length}`, this.errors.length > 0 ? 'error' : 'success');
    this.log(`Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'warning' : 'success');

    return this.errors.length === 0;
  }

  async run() {
    this.log('Starting Foundation build validation...', 'info');

    // Check if dist directory exists
    if (!fs.existsSync(this.distPath)) {
      this.errors.push('dist directory not found. Run npm run build first.');
      return this.generateReport();
    }

    // Run all validations
    this.validateCoreFiles();
    this.validatePlatformFiles();
    this.validateToolsFiles();
    this.validateImports();
    this.validatePackageJson();
    this.validateTypeScript();
    this.validateNorwegianCompliance();

    return this.generateReport();
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new BuildValidator();
  validator
    .run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(chalk.red('Validation failed with error:'), error);
      process.exit(1);
    });
}

module.exports = BuildValidator;
