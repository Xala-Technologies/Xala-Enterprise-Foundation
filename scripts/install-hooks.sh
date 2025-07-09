#!/bin/bash

# Xala Enterprise Foundation - Install Development Hooks
# Sets up local development environment with validation hooks

echo "🚀 Installing Xala Enterprise Foundation development hooks..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    print_error "Not in a Git repository"
    exit 1
fi

# Check if we're in the Foundation package
if [[ ! -f "package.json" ]] || ! grep -q "@xala-technologies/foundation" package.json; then
    print_error "This script must be run from the Foundation package root"
    exit 1
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh
print_status "Scripts are now executable"

# Install pre-commit hook
echo "🪝 Installing pre-commit hook..."
if [[ ! -d ".git/hooks" ]]; then
    print_error ".git/hooks directory not found"
    exit 1
fi

# Create pre-commit hook
cp scripts/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
print_status "Pre-commit hook installed"

# Add convenience aliases to package.json scripts
echo "📝 Adding convenience script aliases..."

# Check if we need to add scripts
if ! grep -q "validate:local" package.json; then
    # Create backup
    cp package.json package.json.backup

    # Add validation scripts using node
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Add validation scripts
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['validate:local'] = 'bash scripts/validate-local.sh';
    pkg.scripts['validate:quick'] = 'bash scripts/quick-test.sh';
    pkg.scripts['validate:ci'] = 'bash scripts/simulate-ci.sh';
    pkg.scripts['install:hooks'] = 'bash scripts/install-hooks.sh';

    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "

    print_status "Convenience scripts added to package.json"
else
    print_warning "Convenience scripts already exist in package.json"
fi

# Create .nvmrc for Node version consistency
if [[ ! -f ".nvmrc" ]]; then
    node --version | sed 's/v//' > .nvmrc
    print_status "Created .nvmrc file with current Node version"
fi

# Create .gitignore entries for development
echo "📁 Updating .gitignore..."
GITIGNORE_ENTRIES=(
    "# Development validation"
    "test-data/"
    "coverage/"
    ".nyc_output/"
    "*.log"
    "*.tsbuildinfo"
    "package.json.backup"
)

for entry in "${GITIGNORE_ENTRIES[@]}"; do
    if ! grep -q "$entry" .gitignore 2>/dev/null; then
        echo "$entry" >> .gitignore
    fi
done

print_status ".gitignore updated"

echo ""
echo "🎉 Development environment setup complete!"
echo "================================================"
echo "✅ Scripts are executable"
echo "✅ Pre-commit hook installed"
echo "✅ Convenience scripts added"
echo "✅ .nvmrc created"
echo "✅ .gitignore updated"
echo ""
echo "📋 Available commands:"
echo "  pnpm run validate:quick  - Quick validation (fast)"
echo "  pnpm run validate:local  - Full local validation"
echo "  pnpm run validate:ci     - CI simulation"
echo "  pnpm run install:hooks   - Reinstall hooks"
echo ""
echo "🔍 Pre-commit hook will now run automatically before commits"
echo "🚀 Ready for development!"
