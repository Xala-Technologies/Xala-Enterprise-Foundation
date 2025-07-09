#!/bin/bash

# {{PACKAGE_NAME}} Package - Quick Test Script
# Fast validation for development iterations

set -e

echo "⚡ {{PACKAGE_NAME}} Package - Quick Test"
echo "======================================="

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

print_section() {
    echo -e "\n${YELLOW}🔍 $1${NC}"
}

# Quick validation steps
quick_typecheck() {
    print_section "TypeScript Check"
    pnpm run typecheck
    print_status "TypeScript passed"
}

quick_lint() {
    print_section "Linting"
    pnpm run lint
    print_status "Linting passed"
}

quick_build() {
    print_section "Build"
    pnpm run build
    print_status "Build passed"
}

quick_test() {
    print_section "Core Tests"
    # Run tests with timeout and force exit
    timeout 300 pnpm run test:ci --forceExit --detectOpenHandles --testTimeout=5000 --maxWorkers=50%
    print_status "Tests passed"
}

# Main workflow
main() {
    local start_time=$(date +%s)

    echo "🕐 Starting quick validation at $(date)"

    # Run quick validations
    quick_typecheck
    quick_lint
    quick_build
    quick_test

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo ""
    echo "🎉 QUICK VALIDATION PASSED! 🎉"
    echo "✅ TypeScript: OK"
    echo "✅ Linting: OK"
    echo "✅ Build: OK"
    echo "✅ Tests: OK"
    echo ""
    echo "🕐 Time: ${duration}s"
    echo "🚀 Ready for development!"
}

# Handle errors
trap 'print_error "Quick validation failed at: $BASH_COMMAND"' ERR

# Run main function
main "$@"
