/**
 * Test Multi-Platform Imports (ES Modules)
 * Simple test to verify all platform ES module imports work correctly
 */

console.log('🧪 Testing Multi-Platform ES Module Imports...\n');

// Test Core Foundation Import
console.log('Testing core foundation import...');
try {
  const { createLogger, initializeFoundation } = await import('./dist/index.esm.js');
  console.log('✅ Core foundation imported successfully');
  console.log('   createLogger:', typeof createLogger);
  console.log('   initializeFoundation:', typeof initializeFoundation);
} catch (error) {
  console.error('❌ Core foundation import failed:', error.message);
}

// Test Web Platform Import
console.log('\nTesting web platform import...');
try {
  const { setupWebFoundation, PLATFORM } = await import('./dist/platforms/web/index.esm.js');
  console.log('✅ Web platform imported successfully');
  console.log('   setupWebFoundation:', typeof setupWebFoundation);
  console.log('   Platform:', PLATFORM);
} catch (error) {
  console.error('❌ Web platform import failed:', error.message);
}

// Test Mobile Platform Import
console.log('\nTesting mobile platform import...');
try {
  const { setupMobileFoundation, PLATFORM } = await import('./dist/platforms/mobile/index.esm.js');
  console.log('✅ Mobile platform imported successfully');
  console.log('   setupMobileFoundation:', typeof setupMobileFoundation);
  console.log('   Platform:', PLATFORM);
} catch (error) {
  console.error('❌ Mobile platform import failed:', error.message);
}

// Test Desktop Platform Import
console.log('\nTesting desktop platform import...');
try {
  const { setupDesktopFoundation, PLATFORM } = await import('./dist/platforms/desktop/index.esm.js');
  console.log('✅ Desktop platform imported successfully');
  console.log('   setupDesktopFoundation:', typeof setupDesktopFoundation);
  console.log('   Platform:', PLATFORM);
} catch (error) {
  console.error('❌ Desktop platform import failed:', error.message);
}

// Test API Platform Import
console.log('\nTesting API platform import...');
try {
  const { setupAPIFoundation, PLATFORM } = await import('./dist/platforms/api/index.esm.js');
  console.log('✅ API platform imported successfully');
  console.log('   setupAPIFoundation:', typeof setupAPIFoundation);
  console.log('   Platform:', PLATFORM);
} catch (error) {
  console.error('❌ API platform import failed:', error.message);
}

console.log('\n🎉 ES Module Import Testing Complete!'); 