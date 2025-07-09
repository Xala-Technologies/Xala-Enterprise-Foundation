#!/usr/bin/env node

/**
 * Import Testing Script for Foundation Package
 * Tests all platform imports and validates exported functionality
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImportTester {
  constructor() {
    this.results = [];
    this.distPath = path.join(path.dirname(__dirname), 'dist');
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[34m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m',
    };
    console.log(`${colors[type]}[${type.toUpperCase()}]${colors.reset} ${message}`);
  }

  async testImport(modulePath, expectedExports, description) {
    try {
      this.log(`Testing ${description}...`, 'info');

      // Use dynamic import for ES modules
      const module = await import(modulePath);
      const missingExports = [];
      const foundExports = [];

      expectedExports.forEach(exportName => {
        if (module[exportName] || module.default?.[exportName]) {
          foundExports.push(exportName);
        } else {
          missingExports.push(exportName);
        }
      });

      const result = {
        description,
        modulePath,
        success: missingExports.length === 0,
        foundExports,
        missingExports,
        totalExports:
          Object.keys(module).length + (module.default ? Object.keys(module.default).length : 0),
      };

      this.results.push(result);

      if (result.success) {
        this.log(
          `✓ ${description} - All exports found (${foundExports.length}/${expectedExports.length})`,
          'success'
        );
      } else {
        this.log(`❌ ${description} - Missing exports: ${missingExports.join(', ')}`, 'error');
      }

      return result;
    } catch (error) {
      const result = {
        description,
        modulePath,
        success: false,
        error: error.message,
        foundExports: [],
        missingExports: expectedExports,
        totalExports: 0,
      };

      this.results.push(result);
      this.log(`❌ ${description} - Import failed: ${error.message}`, 'error');
      return result;
    }
  }

  async testCoreImports() {
    this.log('\n=== TESTING CORE FOUNDATION IMPORTS ===', 'info');

    const coreExpectedExports = [
      'FoundationLogger',
      'FoundationFeatureToggle',
      'FoundationErrorHandler',
      'FoundationI18n',
      'FoundationMetrics',
      'FoundationHealthCheck',
      'FoundationEventCore',
      'FoundationSagaOrchestrator',
      'FoundationConfigLoader',
    ];

    // Test CommonJS import
    const cjsPath = path.join(this.distPath, 'index.js');
    await this.testImport(cjsPath, coreExpectedExports, 'Core Foundation (CommonJS)');

    // Test ESM import
    const esmPath = path.join(this.distPath, 'index.esm.js');
    await this.testImport(esmPath, coreExpectedExports, 'Core Foundation (ESM)');
  }

  async testWebPlatformImports() {
    this.log('\n=== TESTING WEB PLATFORM IMPORTS ===', 'info');

    const webExpectedExports = [
      'FoundationWebSetup',
      'FoundationWebStorage',
      'FoundationWebAnalytics',
      'FoundationWebPerformance',
    ];

    const webCjsPath = path.join(this.distPath, 'platforms/web/index.js');
    await this.testImport(webCjsPath, webExpectedExports, 'Web Platform (CommonJS)');

    const webEsmPath = path.join(this.distPath, 'platforms/web/index.esm.js');
    await this.testImport(webEsmPath, webExpectedExports, 'Web Platform (ESM)');
  }

  async testMobilePlatformImports() {
    this.log('\n=== TESTING MOBILE PLATFORM IMPORTS ===', 'info');

    const mobileExpectedExports = [
      'FoundationMobileSetup',
      'FoundationMobileAuth',
      'FoundationMobileStorage',
    ];

    const mobileCjsPath = path.join(this.distPath, 'platforms/mobile/index.js');
    await this.testImport(mobileCjsPath, mobileExpectedExports, 'Mobile Platform (CommonJS)');

    const mobileEsmPath = path.join(this.distPath, 'platforms/mobile/index.esm.js');
    await this.testImport(mobileEsmPath, mobileExpectedExports, 'Mobile Platform (ESM)');
  }

  async testDesktopPlatformImports() {
    this.log('\n=== TESTING DESKTOP PLATFORM IMPORTS ===', 'info');

    const desktopExpectedExports = [
      'FoundationDesktopSetup',
      'FoundationDesktopAuth',
      'FoundationDesktopStorage',
    ];

    const desktopCjsPath = path.join(this.distPath, 'platforms/desktop/index.js');
    await this.testImport(desktopCjsPath, desktopExpectedExports, 'Desktop Platform (CommonJS)');

    const desktopEsmPath = path.join(this.distPath, 'platforms/desktop/index.esm.js');
    await this.testImport(desktopEsmPath, desktopExpectedExports, 'Desktop Platform (ESM)');
  }

  async testAPIPlatformImports() {
    this.log('\n=== TESTING API PLATFORM IMPORTS ===', 'info');

    const apiExpectedExports = [
      'FoundationAPISetup',
      'FoundationAPIController',
      'FoundationAPIMiddleware',
    ];

    const apiCjsPath = path.join(this.distPath, 'platforms/api/index.js');
    await this.testImport(apiCjsPath, apiExpectedExports, 'API Platform (CommonJS)');

    const apiEsmPath = path.join(this.distPath, 'platforms/api/index.esm.js');
    await this.testImport(apiEsmPath, apiExpectedExports, 'API Platform (ESM)');
  }

  async testBackwardCompatibility() {
    this.log('\n=== TESTING BACKWARD COMPATIBILITY ===', 'info');

    try {
      // Test that basic v1.x imports still work
      const core = await import(path.join(this.distPath, 'index.js'));

      // Test core functionality is still accessible
      if (core.FoundationLogger || core.default?.FoundationLogger) {
        this.log('✓ Logger backward compatibility maintained', 'success');
      } else {
        this.log('❌ Logger backward compatibility broken', 'error');
      }

      if (core.FoundationConfigLoader || core.default?.FoundationConfigLoader) {
        this.log('✓ Config loader backward compatibility maintained', 'success');
      } else {
        this.log('❌ Config loader backward compatibility broken', 'error');
      }
    } catch (error) {
      this.log(`❌ Backward compatibility test failed: ${error.message}`, 'error');
    }
  }

  generateSummaryReport() {
    this.log('\n=== MIGRATION TESTING SUMMARY ===', 'info');

    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;

    this.log(`Total Import Tests: ${totalTests}`, 'info');
    this.log(
      `Successful: ${successfulTests}`,
      successfulTests === totalTests ? 'success' : 'warning'
    );
    this.log(`Failed: ${failedTests}`, failedTests === 0 ? 'success' : 'error');

    if (failedTests > 0) {
      this.log('\nFailed Tests:', 'error');
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          this.log(
            `  • ${result.description}: ${result.error || result.missingExports.join(', ')}`,
            'error'
          );
        });
    }

    // Platform-specific summary
    const platformResults = {
      core: this.results.filter(r => r.description.includes('Core Foundation')),
      web: this.results.filter(r => r.description.includes('Web Platform')),
      mobile: this.results.filter(r => r.description.includes('Mobile Platform')),
      desktop: this.results.filter(r => r.description.includes('Desktop Platform')),
      api: this.results.filter(r => r.description.includes('API Platform')),
    };

    this.log('\nPlatform Migration Status:', 'info');
    Object.entries(platformResults).forEach(([platform, results]) => {
      const success = results.every(r => r.success);
      const status = success ? '✅' : '❌';
      this.log(
        `  ${status} ${platform.toUpperCase()}: ${results.filter(r => r.success).length}/${results.length} imports working`,
        success ? 'success' : 'error'
      );
    });

    return failedTests === 0;
  }

  async run() {
    this.log('Starting Foundation migration testing...', 'info');

    try {
      await this.testCoreImports();
      await this.testWebPlatformImports();
      await this.testMobilePlatformImports();
      await this.testDesktopPlatformImports();
      await this.testAPIPlatformImports();
      await this.testBackwardCompatibility();

      return this.generateSummaryReport();
    } catch (error) {
      this.log(`Migration testing failed with error: ${error.message}`, 'error');
      return false;
    }
  }
}

// Run migration testing if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ImportTester();
  tester
    .run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('\x1b[31mMigration testing failed:\x1b[0m', error);
      process.exit(1);
    });
}
