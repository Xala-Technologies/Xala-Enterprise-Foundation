#!/usr/bin/env node

/**
 * Bundle Analyzer Script for Foundation Package
 * Analyzes bundle sizes, dependencies, and optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class BundleAnalyzer {
  constructor() {
    this.distPath = path.join(process.cwd(), 'dist');
    this.analysisResults = {
      bundles: [],
      totalSize: 0,
      gzippedSize: 0,
      recommendations: [],
    };
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

  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  getGzippedSize(filePath) {
    try {
      const { execSync } = require('child_process');
      const result = execSync(`gzip -c "${filePath}" | wc -c`, { encoding: 'utf8' });
      return parseInt(result.trim(), 10);
    } catch (error) {
      return 0;
    }
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  analyzeBundleComposition(bundlePath) {
    try {
      // Use rollup-plugin-analyzer output if available
      const analysisFile = bundlePath.replace('.js', '.analysis.json');
      if (fs.existsSync(analysisFile)) {
        const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
        return analysis;
      }

      // Fallback: basic size analysis
      const content = fs.readFileSync(bundlePath, 'utf8');
      return {
        modules: [],
        dependencies: this.extractDependencies(content),
        codeSize: content.length,
        estimatedModuleCount: (content.match(/function/g) || []).length,
      };
    } catch (error) {
      return null;
    }
  }

  extractDependencies(content) {
    const requires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
    const imports = content.match(/from ['"]([^'"]+)['"]/g) || [];

    return [
      ...new Set([
        ...requires.map(r => r.match(/require\(['"]([^'"]+)['"]\)/)[1]),
        ...imports.map(i => i.match(/from ['"]([^'"]+)['"]/)[1]),
      ]),
    ];
  }

  analyzeBundle(bundlePath, bundleName) {
    this.log(`Analyzing ${bundleName}...`, 'info');

    const size = this.getFileSize(bundlePath);
    const gzippedSize = this.getGzippedSize(bundlePath);
    const composition = this.analyzeBundleComposition(bundlePath);

    const bundleAnalysis = {
      name: bundleName,
      path: bundlePath,
      size,
      gzippedSize,
      compression: (((size - gzippedSize) / size) * 100).toFixed(1),
      composition,
    };

    this.analysisResults.bundles.push(bundleAnalysis);
    this.analysisResults.totalSize += size;
    this.analysisResults.gzippedSize += gzippedSize;

    // Generate size-based recommendations
    this.generateSizeRecommendations(bundleAnalysis);

    return bundleAnalysis;
  }

  generateSizeRecommendations(bundle) {
    const sizeKB = bundle.size / 1024;
    const gzippedKB = bundle.gzippedSize / 1024;

    // Platform-specific size thresholds
    const thresholds = {
      core: { warning: 40, critical: 50 },
      web: { warning: 20, critical: 25 },
      mobile: { warning: 25, critical: 30 },
      desktop: { warning: 30, critical: 35 },
      api: { warning: 35, critical: 40 },
      cli: { warning: 80, critical: 100 },
    };

    const platform = this.detectPlatform(bundle.name);
    const threshold = thresholds[platform] || thresholds.core;

    if (sizeKB > threshold.critical) {
      this.analysisResults.recommendations.push({
        type: 'critical',
        bundle: bundle.name,
        message: `Bundle size ${sizeKB.toFixed(1)}KB exceeds critical threshold ${threshold.critical}KB`,
        suggestions: [
          'Review and remove unused dependencies',
          'Implement code splitting',
          'Consider lazy loading for non-critical modules',
          'Use tree shaking to eliminate dead code',
        ],
      });
    } else if (sizeKB > threshold.warning) {
      this.analysisResults.recommendations.push({
        type: 'warning',
        bundle: bundle.name,
        message: `Bundle size ${sizeKB.toFixed(1)}KB exceeds warning threshold ${threshold.warning}KB`,
        suggestions: [
          'Review dependencies for optimization opportunities',
          'Consider code splitting for larger modules',
          'Optimize imports to reduce bundle size',
        ],
      });
    }

    // Compression recommendations
    const compressionRatio = parseFloat(bundle.compression);
    if (compressionRatio < 60) {
      this.analysisResults.recommendations.push({
        type: 'optimization',
        bundle: bundle.name,
        message: `Low compression ratio ${compressionRatio}% suggests optimization opportunities`,
        suggestions: [
          'Minimize repeated code patterns',
          'Use consistent variable naming for better compression',
          'Remove unnecessary whitespace and comments in production builds',
        ],
      });
    }
  }

  detectPlatform(bundleName) {
    if (bundleName.includes('web')) return 'web';
    if (bundleName.includes('mobile')) return 'mobile';
    if (bundleName.includes('desktop')) return 'desktop';
    if (bundleName.includes('api')) return 'api';
    if (bundleName.includes('cli')) return 'cli';
    return 'core';
  }

  analyzeAllBundles() {
    this.log('Starting comprehensive bundle analysis...', 'info');

    // Core bundles
    const coreBundles = [
      { path: 'index.js', name: 'Core CJS' },
      { path: 'index.esm.js', name: 'Core ESM' },
      { path: 'index.umd.js', name: 'Core UMD' },
    ];

    coreBundles.forEach(bundle => {
      const fullPath = path.join(this.distPath, bundle.path);
      if (fs.existsSync(fullPath)) {
        this.analyzeBundle(fullPath, bundle.name);
      }
    });

    // Platform bundles
    const platforms = ['web', 'mobile', 'desktop', 'api'];
    const formats = ['index.js', 'index.esm.js'];

    platforms.forEach(platform => {
      formats.forEach(format => {
        const bundlePath = path.join(this.distPath, `platforms/${platform}/${format}`);
        if (fs.existsSync(bundlePath)) {
          const bundleName = `${platform.charAt(0).toUpperCase() + platform.slice(1)} ${format.includes('esm') ? 'ESM' : 'CJS'}`;
          this.analyzeBundle(bundlePath, bundleName);
        }
      });
    });

    // CLI bundle
    const cliBundlePath = path.join(this.distPath, 'tools/cli/index.js');
    if (fs.existsSync(cliBundlePath)) {
      this.analyzeBundle(cliBundlePath, 'CLI Tools');
    }
  }

  analyzeDependencyOverlap() {
    this.log('Analyzing dependency overlap...', 'info');

    const allDependencies = new Map();

    this.analysisResults.bundles.forEach(bundle => {
      if (bundle.composition && bundle.composition.dependencies) {
        bundle.composition.dependencies.forEach(dep => {
          if (!allDependencies.has(dep)) {
            allDependencies.set(dep, []);
          }
          allDependencies.get(dep).push(bundle.name);
        });
      }
    });

    // Find shared dependencies
    const sharedDependencies = Array.from(allDependencies.entries())
      .filter(([dep, bundles]) => bundles.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    if (sharedDependencies.length > 0) {
      this.analysisResults.recommendations.push({
        type: 'optimization',
        bundle: 'Multiple bundles',
        message: `Found ${sharedDependencies.length} shared dependencies across bundles`,
        suggestions: [
          'Consider creating a shared dependency bundle',
          'Implement proper code splitting to avoid duplication',
          'Use external dependencies where appropriate',
        ],
        details: sharedDependencies
          .slice(0, 5)
          .map(([dep, bundles]) => `${dep} used in: ${bundles.join(', ')}`),
      });
    }
  }

  generateOptimizationReport() {
    this.log('\n=== BUNDLE ANALYSIS REPORT ===', 'info');

    // Overall statistics
    this.log(`Total Bundle Size: ${this.formatSize(this.analysisResults.totalSize)}`, 'info');
    this.log(`Total Gzipped Size: ${this.formatSize(this.analysisResults.gzippedSize)}`, 'info');
    this.log(
      `Overall Compression: ${(((this.analysisResults.totalSize - this.analysisResults.gzippedSize) / this.analysisResults.totalSize) * 100).toFixed(1)}%`,
      'info'
    );

    // Bundle breakdown
    this.log('\n📦 Bundle Breakdown:', 'info');
    this.analysisResults.bundles
      .sort((a, b) => b.size - a.size)
      .forEach(bundle => {
        const sizeKB = (bundle.size / 1024).toFixed(1);
        const gzippedKB = (bundle.gzippedSize / 1024).toFixed(1);
        this.log(
          `  ${bundle.name}: ${sizeKB}KB (${gzippedKB}KB gzipped, ${bundle.compression}% compression)`,
          'info'
        );
      });

    // Platform comparison
    this.log('\n🎯 Platform Size Comparison:', 'info');
    const platformSizes = {};
    this.analysisResults.bundles.forEach(bundle => {
      const platform = this.detectPlatform(bundle.name);
      if (!platformSizes[platform]) {
        platformSizes[platform] = { total: 0, gzipped: 0, count: 0 };
      }
      platformSizes[platform].total += bundle.size;
      platformSizes[platform].gzipped += bundle.gzippedSize;
      platformSizes[platform].count++;
    });

    Object.entries(platformSizes).forEach(([platform, sizes]) => {
      const avgSize = (sizes.total / sizes.count / 1024).toFixed(1);
      const avgGzipped = (sizes.gzipped / sizes.count / 1024).toFixed(1);
      this.log(`  ${platform.toUpperCase()}: ${avgSize}KB avg (${avgGzipped}KB gzipped)`, 'info');
    });

    // Recommendations
    if (this.analysisResults.recommendations.length > 0) {
      this.log('\n💡 Optimization Recommendations:', 'warning');

      const criticalRecs = this.analysisResults.recommendations.filter(r => r.type === 'critical');
      const warningRecs = this.analysisResults.recommendations.filter(r => r.type === 'warning');
      const optimizationRecs = this.analysisResults.recommendations.filter(
        r => r.type === 'optimization'
      );

      if (criticalRecs.length > 0) {
        this.log('\n🔴 Critical Issues:', 'error');
        criticalRecs.forEach(rec => {
          this.log(`  • ${rec.message}`, 'error');
          rec.suggestions.forEach(suggestion => {
            this.log(`    - ${suggestion}`, 'error');
          });
        });
      }

      if (warningRecs.length > 0) {
        this.log('\n🟡 Warnings:', 'warning');
        warningRecs.forEach(rec => {
          this.log(`  • ${rec.message}`, 'warning');
          rec.suggestions.forEach(suggestion => {
            this.log(`    - ${suggestion}`, 'warning');
          });
        });
      }

      if (optimizationRecs.length > 0) {
        this.log('\n🟢 Optimization Opportunities:', 'info');
        optimizationRecs.forEach(rec => {
          this.log(`  • ${rec.message}`, 'info');
          rec.suggestions.forEach(suggestion => {
            this.log(`    - ${suggestion}`, 'info');
          });
          if (rec.details) {
            rec.details.forEach(detail => {
              this.log(`    📋 ${detail}`, 'info');
            });
          }
        });
      }
    } else {
      this.log('\n✅ No optimization recommendations - bundles are well optimized!', 'success');
    }

    // Performance impact analysis
    this.generatePerformanceImpactAnalysis();

    return this.analysisResults.recommendations.filter(r => r.type === 'critical').length === 0;
  }

  generatePerformanceImpactAnalysis() {
    this.log('\n⚡ Performance Impact Analysis:', 'info');

    // Network impact analysis
    const webBundles = this.analysisResults.bundles.filter(b => b.name.includes('Web'));
    if (webBundles.length > 0) {
      const totalWebSize = webBundles.reduce((sum, b) => sum + b.gzippedSize, 0);
      const loadTime3G = (totalWebSize / (1.6 * 1024)).toFixed(1); // 1.6MB/s for 3G
      const loadTime4G = (totalWebSize / (5 * 1024)).toFixed(1); // 5MB/s for 4G

      this.log(`  Web Bundle Load Time (3G): ~${loadTime3G}s`, 'info');
      this.log(`  Web Bundle Load Time (4G): ~${loadTime4G}s`, 'info');

      if (parseFloat(loadTime3G) > 3) {
        this.log('  ⚠️  Web bundle may cause slow loading on 3G connections', 'warning');
      }
    }

    // Memory impact analysis
    const totalUncompressedSize = this.analysisResults.totalSize;
    const estimatedMemoryUsage = totalUncompressedSize * 2; // Rough estimate including runtime overhead

    this.log(`  Estimated Memory Usage: ${this.formatSize(estimatedMemoryUsage)}`, 'info');

    if (estimatedMemoryUsage > 10 * 1024 * 1024) {
      // 10MB
      this.log('  ⚠️  High memory usage may impact performance on low-end devices', 'warning');
    }
  }

  saveReport() {
    const reportPath = path.join(this.distPath, 'bundle-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.analysisResults, null, 2));
    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'info');
  }

  async run() {
    this.log('Starting Foundation bundle analysis...', 'info');

    if (!fs.existsSync(this.distPath)) {
      this.log('dist directory not found. Run npm run build first.', 'error');
      return false;
    }

    this.analyzeAllBundles();
    this.analyzeDependencyOverlap();
    const success = this.generateOptimizationReport();
    this.saveReport();

    return success;
  }
}

// Run bundle analysis if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer
    .run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(chalk.red('Bundle analysis failed:'), error);
      process.exit(1);
    });
}

module.exports = BundleAnalyzer;
