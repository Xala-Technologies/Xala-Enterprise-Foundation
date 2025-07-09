// ==========================================
// scripts/validate-commit-message.js - Norwegian Commit Message Validator
// ==========================================

const fs = require('fs');

function validateCommitMessage(commitMsgFile) {
  const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim();

  // Norwegian compliance keywords
  const complianceKeywords = [
    'nsm',
    'gdpr',
    'wcag',
    'accessibility',
    'security',
    'norwegian',
    'compliance',
    'audit',
    'classification',
  ];

  // Check for compliance-related commits
  const hasComplianceKeyword = complianceKeywords.some(keyword =>
    commitMsg.toLowerCase().includes(keyword)
  );

  if (hasComplianceKeyword) {
    console.log('🇳🇴 Compliance-related commit detected');

    // Additional validation for compliance commits
    if (
      !commitMsg.includes('BREAKING CHANGE:') &&
      (commitMsg.includes('security') || commitMsg.includes('gdpr'))
    ) {
      console.log('ℹ️  Consider adding BREAKING CHANGE: if this affects compliance');
    }
  }

  // Conventional commit format validation
  const conventionalPattern =
    /^(feat|fix|docs|style|refactor|perf|test|chore|compliance)(\(.+\))?: .{1,50}/;

  if (!conventionalPattern.test(commitMsg)) {
    console.error('❌ Commit message must follow conventional commit format:');
    console.error('   type(scope): description');
    console.error('   Examples:');
    console.error('   - feat(auth): add Norwegian ID support');
    console.error('   - fix(accessibility): improve WCAG compliance');
    console.error('   - compliance(nsm): update security classification');
    process.exit(1);
  }

  console.log('✅ Commit message format is valid');
}

const commitMsgFile = process.argv[2];
if (commitMsgFile) {
  validateCommitMessage(commitMsgFile);
}
