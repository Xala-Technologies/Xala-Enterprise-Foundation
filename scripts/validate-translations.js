// ==========================================
// scripts/validate-translations.js - Norwegian Translation Validator
// ==========================================

const fs = require('fs');
const path = require('path');

function validateTranslations(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);

    // Check for Norwegian characters
    const norwegianPattern = /[æøåÆØÅ]/;
    const hasNorwegianChars = JSON.stringify(translations).match(norwegianPattern);

    if (!hasNorwegianChars) {
      console.warn(`⚠️  Warning: ${filePath} may be missing Norwegian characters`);
    }

    // Check for required keys
    const requiredKeys = ['common', 'navigation', 'errors'];
    const missingKeys = requiredKeys.filter(key => !translations[key]);

    if (missingKeys.length > 0) {
      console.error(
        `❌ Missing required translation keys in ${filePath}: ${missingKeys.join(', ')}`
      );
      process.exit(1);
    }

    console.log(`✅ Translation file ${filePath} is valid`);
  } catch (error) {
    console.error(`❌ Invalid JSON in translation file ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Validate all translation files
const translationFiles = process.argv.slice(2);
translationFiles.forEach(validateTranslations);
