// ==========================================
// commitlint.config.js - Commit Linting
// ==========================================

module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // Disable all strict rules to allow any commit message format
    'type-enum': [0], // Disabled
    'scope-enum': [0], // Disabled
    'subject-max-length': [0], // Disabled
    'subject-case': [0], // Disabled
    'subject-empty': [0], // Disabled
    'subject-full-stop': [0], // Disabled
    'body-max-line-length': [0], // Disabled
    'footer-max-line-length': [0], // Disabled
    'header-max-length': [0], // Disabled
    'body-leading-blank': [0], // Disabled
    'footer-leading-blank': [0], // Disabled
  },
};
