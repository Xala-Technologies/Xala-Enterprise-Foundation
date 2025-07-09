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

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_section() {
    echo -e "\n${YELLOW}🔍 $1${NC}"
    echo "----------------------------------------"
}

# Main validation workflow
main() {
    local start_time=$(date +%s)

    echo "🕐 Starting validation at $(date)"

    print_section "TypeScript Check"
    pnpm run typecheck
    print_status "TypeScript passed"

    print_section "Linting"
    pnpm run lint
    print_status "Linting passed"

    print_section "Build"
    pnpm run build
    print_status "Build passed"

    print_section "Tests"
    pnpm run test:ci --forceExit --detectOpenHandles --testTimeout=10000 --maxWorkers=50%
    print_status "Tests passed"

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo ""
    echo "🎉 ALL VALIDATIONS PASSED! 🎉"
    echo "================================================"
    echo "✅ TypeScript: OK"
    echo "✅ Linting: OK"
    echo "✅ Build: OK"
    echo "✅ Tests: OK"
    echo ""
    echo "🕐 Total validation time: ${duration}s"
    echo "🚀 Ready for commit and push!"
}

# Handle errors
trap 'print_error "Validation failed at step: $BASH_COMMAND"' ERR

# Run main function
main "$@"
