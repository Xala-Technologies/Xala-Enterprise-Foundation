#!/bin/bash

# {{PACKAGE_NAME}} Package - Local Validation Script
# This script mirrors the CI environment exactly to catch issues before pushing

set -e

echo "🚀 {{PACKAGE_NAME}} Package - Local Validation"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_section() {
    echo -e "\n${YELLOW}🔍 $1${NC}"
    echo "----------------------------------------"
}

# Timeout function
timeout_cmd() {
    local timeout_duration=$1
    shift
    timeout $timeout_duration "$@"
}

# Validation steps
validate_environment() {
    print_section "Environment Validation"

    # Check Node.js version
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION"

    # Check pnpm version
    PNPM_VERSION=$(pnpm --version)
    print_status "pnpm version: $PNPM_VERSION"

    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found. Are you in the project root?"
        exit 1
    fi

    # Check if this is a {{PACKAGE_NAME}} package
    if ! grep -q "{{PACKAGE_NAME}}" package.json; then
        print_error "This doesn't appear to be the {{PACKAGE_NAME}} package"
        exit 1
    fi

    print_status "Environment validation passed"
}

install_dependencies() {
    print_section "Dependencies Installation"

    # Clean install (mirrors CI)
    print_status "Installing dependencies with frozen lockfile..."
    timeout_cmd 300 pnpm install --frozen-lockfile

    print_status "Dependencies installed successfully"
}

validate_build() {
    print_section "Build Validation"

    # Clean previous build
    print_status "Cleaning previous build..."
    rm -rf dist/ 2>/dev/null || true

    # Build with timeout
    print_status "Building project..."
    timeout_cmd 300 pnpm run build

    # Validate build outputs
    if [[ ! -d "dist" ]]; then
        print_error "Build failed - dist directory not created"
        exit 1
    fi

    if [[ ! -f "dist/index.js" ]]; then
        print_error "Build failed - index.js not found in dist"
        exit 1
    fi

    print_status "Build validation passed"
}

validate_typescript() {
    print_section "TypeScript Validation"

    # Type checking with timeout
    print_status "Running TypeScript type checking..."
    timeout_cmd 180 pnpm run typecheck

    print_status "TypeScript validation passed"
}

validate_linting() {
    print_section "Linting Validation"

    # ESLint with timeout
    print_status "Running ESLint..."
    timeout_cmd 180 pnpm run lint

    print_status "Linting validation passed"
}

validate_tests() {
    print_section "Test Suite Validation"

    # Run tests with exact CI flags
    print_status "Running comprehensive test suite..."
    timeout_cmd 600 pnpm run test:ci --forceExit --detectOpenHandles --testTimeout=10000 --maxWorkers=50%

    print_status "Test suite validation passed"
}

validate_norwegian_compliance() {
    print_section "Norwegian Compliance Validation"

    # Run Norwegian compliance tests if available
    if [[ -f "scripts/test-norwegian-compliance.mjs" ]]; then
        print_status "Running Norwegian compliance validation..."
        timeout_cmd 300 node scripts/test-norwegian-compliance.mjs
        print_status "Norwegian compliance validation passed"
    else
        print_warning "Norwegian compliance script not found - skipping"
    fi
}

validate_security() {
    print_section "Security Validation"

    # Run security audit
    print_status "Running security audit..."
    timeout_cmd 180 pnpm audit --audit-level moderate

    print_status "Security validation passed"
}

validate_package_structure() {
    print_section "Package Structure Validation"

    # Check required files
    REQUIRED_FILES=(
        "package.json"
        "tsconfig.json"
        "jest.config.cjs"
        "src/index.ts"
        "README.md"
        "LICENSE"
    )

    for file in "${REQUIRED_FILES[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done

    # Check dist structure after build
    DIST_FILES=(
        "dist/index.js"
        "dist/index.d.ts"
    )

    for file in "${DIST_FILES[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "Build output missing: $file"
            exit 1
        fi
    done

    print_status "Package structure validation passed"
}

cleanup() {
    print_section "Cleanup"

    # Clean up test artifacts
    print_status "Cleaning up test data..."
    rm -rf test-data/ 2>/dev/null || true
    rm -rf coverage/ 2>/dev/null || true

    print_status "Cleanup completed"
}

# Main validation workflow
main() {
    local start_time=$(date +%s)

    echo "🕐 Starting validation at $(date)"

    # Run all validation steps
    validate_environment
    install_dependencies
    validate_build
    validate_typescript
    validate_linting
    validate_tests
    validate_norwegian_compliance
    validate_security
    validate_package_structure
    cleanup

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo ""
    echo "🎉 ALL VALIDATIONS PASSED! 🎉"
    echo "================================================"
    echo "✅ Environment: OK"
    echo "✅ Dependencies: OK"
    echo "✅ Build: OK"
    echo "✅ TypeScript: OK"
    echo "✅ Linting: OK"
    echo "✅ Tests: OK"
    echo "✅ Norwegian Compliance: OK"
    echo "✅ Security: OK"
    echo "✅ Package Structure: OK"
    echo ""
    echo "🕐 Total validation time: ${duration}s"
    echo "🚀 Ready for commit and push!"
}

# Handle errors
trap 'print_error "Validation failed at step: $BASH_COMMAND"' ERR

# Run main function
main "$@"
