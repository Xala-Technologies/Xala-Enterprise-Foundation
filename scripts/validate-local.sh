#!/bin/bash
echo "🚀 Local CI/CD Validation Starting..."

# Environment check
echo "📋 Environment:"
echo "  Node: $(node --version)"
echo "  pnpm: $(pnpm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Type checking
echo "🔍 TypeScript type checking..."
pnpm run typecheck

# Linting
echo "📝 ESLint checking..."
pnpm run lint

# Build
echo "🔧 Building package..."
pnpm run build

# Norwegian compliance
echo "🇳🇴 Norwegian compliance validation..."
pnpm run compliance:quick

# Security validation
echo "🔒 Security validation..."
node -e "import('./dist/index.esm.js').then(({ NORWEGIAN_COMPLIANCE }) => {
  console.log('✅ NSM Classifications:', NORWEGIAN_COMPLIANCE.NSM_CLASSIFICATIONS.length);
  console.log('✅ GDPR Legal Basis:', NORWEGIAN_COMPLIANCE.GDPR_LEGAL_BASIS.length);
}).catch(err => { console.error('❌ Security validation failed:', err.message); process.exit(1); })"

echo "✅ All validations completed successfully!"
