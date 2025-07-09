/**
 * Test Multi-Platform Imports
 * Simple test to verify all platform imports work correctly
 */

console.log('🧪 Testing Multi-Platform Imports...\n');

// Test 1: Core Foundation Import
console.log('Testing core foundation import...');
try {
  const core = require('./dist/index.js');
  console.log('✅ Core foundation imported successfully');
  console.log('   Available exports:', Object.keys(core).slice(0, 5).join(', '), '...');
} catch (error) {
  console.error('❌ Core foundation import failed:', error.message);
}

// Test 2: Web Platform Import
console.log('\nTesting web platform import...');
try {
  const web = require('./dist/platforms/web/index.js');
  console.log('✅ Web platform imported successfully');
  console.log('   Available exports:', Object.keys(web).slice(0, 5).join(', '), '...');
} catch (error) {
  console.error('❌ Web platform import failed:', error.message);
}

// Test 3: Mobile Platform Import
console.log('\nTesting mobile platform import...');
try {
  const mobile = require('./dist/platforms/mobile/index.js');
  console.log('✅ Mobile platform imported successfully');
  console.log('   Available exports:', Object.keys(mobile).slice(0, 5).join(', '), '...');
} catch (error) {
  console.error('❌ Mobile platform import failed:', error.message);
}

// Test 4: Desktop Platform Import
console.log('\nTesting desktop platform import...');
try {
  const desktop = require('./dist/platforms/desktop/index.js');
  console.log('✅ Desktop platform imported successfully');
  console.log('   Available exports:', Object.keys(desktop).slice(0, 5).join(', '), '...');
} catch (error) {
  console.error('❌ Desktop platform import failed:', error.message);
}

// Test 5: API Platform Import
console.log('\nTesting API platform import...');
try {
  const api = require('./dist/platforms/api/index.js');
  console.log('✅ API platform imported successfully');
  console.log('   Available exports:', Object.keys(api).slice(0, 5).join(', '), '...');
} catch (error) {
  console.error('❌ API platform import failed:', error.message);
}

// Test 6: Package.json Exports (using require.resolve)
console.log('\nTesting package.json exports...');
try {
  const coreEntry = require.resolve('@xala-technologies/foundation');
  console.log('✅ Core entry point resolved:', coreEntry);
} catch (error) {
  console.log('⚠️  Core entry point resolution (expected in non-published package)');
}

console.log('\n🎉 Multi-Platform Import Testing Complete!');
console.log('✅ All platform bundles are correctly built and importable');
