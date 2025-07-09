#!/usr/bin/env node

const pkg = require('../package.json');

console.log(`✅ ${pkg.name} v${pkg.version} - Health Check Passed`);
console.log('📦 Foundation package is ready');

// Check if main exports are available
try {
  require('../dist/index.js');
  console.log('✅ Main exports available');
} catch (error) {
  console.error('❌ Main exports not available:', error.message);
  process.exit(1);
}

console.log('🎉 All checks passed');
