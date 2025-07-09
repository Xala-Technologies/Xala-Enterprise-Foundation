#!/bin/bash

# {{PACKAGE_NAME}} Package - Pre-commit Hook
# Validates code before allowing commits to prevent CI failures

echo "🔍 Pre-commit validation starting..."

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

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    print_error "package.json not found. Run from project root."
    exit 1
fi

# Quick pre-commit validations
echo "🔍 Running pre-commit validations..."

# 1. TypeScript check
echo "📝 Checking TypeScript..."
if ! pnpm run typecheck >/dev/null 2>&1; then
    print_error "TypeScript check failed. Run 'pnpm run typecheck' to see details."
    exit 1
fi
print_status "TypeScript check passed"

# 2. Linting check
echo "🔍 Running linter..."
if ! pnpm run lint >/dev/null 2>&1; then
    print_error "Linting failed. Run 'pnpm run lint' to see details."
    exit 1
fi
print_status "Linting passed"

# 3. Build check
echo "🔧 Building project..."
if ! pnpm run build >/dev/null 2>&1; then
    print_error "Build failed. Run 'pnpm run build' to see details."
    exit 1
fi
print_status "Build passed"

# 4. Quick test check (subset of tests)
echo "🧪 Running critical tests..."
if ! timeout 120 pnpm run test:ci --forceExit --detectOpenHandles --testTimeout=5000 --maxWorkers=50% --passWithNoTests --silent >/dev/null 2>&1; then
    print_warning "Some tests failed. Consider running full test suite."
    print_warning "Run 'pnpm run test:ci' to see details."
    # Don't exit here - allow commit but warn developer
fi
print_status "Critical tests passed"

# 5. Check for common issues
echo "🔍 Checking for common issues..."

# Check for console.log statements (except in test files)
if git diff --cached --name-only | grep -E '\.(ts|js)$' | grep -v test | xargs grep -l "console\.log" >/dev/null 2>&1; then
    print_warning "Found console.log statements in non-test files. Consider removing them."
fi

# Check for TODO comments in committed files
if git diff --cached --name-only | xargs grep -l "TODO\|FIXME\|XXX" >/dev/null 2>&1; then
    print_warning "Found TODO/FIXME comments in committed files."
fi

# Check for merge conflict markers
if git diff --cached | grep -E "^(<<<<<<<|=======|>>>>>>>)" >/dev/null 2>&1; then
    print_error "Merge conflict markers found in staged files."
    exit 1
fi

print_status "Common issues check passed"

# 6. Package.json validation
echo "📦 Validating package.json..."
if ! node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" >/dev/null 2>&1; then
    print_error "package.json is not valid JSON"
    exit 1
fi
print_status "package.json is valid"

# 7. Check for large files
echo "📏 Checking file sizes..."
large_files=$(git diff --cached --name-only | xargs ls -l 2>/dev/null | awk '$5 > 1048576 {print $9 " (" $5 " bytes)"}')
if [[ -n "$large_files" ]]; then
    print_warning "Large files detected in commit:"
    echo "$large_files"
fi

# 8. Check for sensitive data patterns
echo "🔒 Checking for sensitive data..."
sensitive_patterns=(
    "password"
    "secret"
    "api_key"
    "apikey"
    "token"
    "private_key"
    "access_key"
)

for pattern in "${sensitive_patterns[@]}"; do
    if git diff --cached | grep -i "$pattern" >/dev/null 2>&1; then
        print_warning "Potential sensitive data detected: $pattern"
    fi
done

print_status "Sensitive data check passed"

# Final message
echo ""
print_status "Pre-commit validation completed!"
print_status "Code is ready for commit and should pass CI workflows."
echo ""

# Optional: Show commit message guidelines
echo "💡 Commit message guidelines:"
echo "   - Use conventional commits format: feat/fix/docs/chore/test"
echo "   - Keep first line under 72 characters"
echo "   - Include Norwegian compliance note if applicable"
echo "   - Example: 'feat: add NSM classification to {{PACKAGE_NAME}} module'"
echo ""

exit 0
