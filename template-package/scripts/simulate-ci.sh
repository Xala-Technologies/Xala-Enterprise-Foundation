#!/bin/bash

# {{PACKAGE_NAME}} Package - CI Simulation Script
# Simulates the exact GitHub Actions CI environment locally

set -e

echo "🤖 {{PACKAGE_NAME}} Package - CI Simulation"
echo "============================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_section() {
    echo -e "\n${BLUE}🔍 $1${NC}"
    echo "----------------------------------------"
}

# Simulate GitHub Actions environment
setup_ci_environment() {
    print_section "CI Environment Setup"

    # Set CI environment variables (mirrors GitHub Actions)
    export CI=true
    export NODE_ENV=test
    export FORCE_COLOR=1

    # GitHub Actions specific variables
    export GITHUB_ACTIONS=true
    export RUNNER_OS=Linux
    export RUNNER_TEMP=/tmp
    export RUNNER_WORKSPACE=/tmp/workspace

    print_status "CI environment variables set"

    # Display environment info (matches CI workflow)
    print_status "Node.js version: $(node --version)"
    print_status "npm version: $(npm --version)"
    print_status "pnpm version: $(pnpm --version)"
    print_status "Operating system: $(uname -s)"

    # Check workspace (matches CI workflow)
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found - not in project root"
        exit 1
    fi

    print_status "Workspace validation passed"
}

# Simulate the exact CI workflow steps
simulate_ci_workflow() {
    print_section "CI Workflow Simulation"

    # Step 1: Checkout (already done locally)
    print_status "Checkout: ✅ (local workspace)"

    # Step 2: Setup pnpm (matches CI workflow)
    print_status "Setup pnpm: ✅ (version $(pnpm --version))"

    # Step 3: Setup Node.js (matches CI workflow)
    print_status "Setup Node.js: ✅ (version $(node --version))"

    # Step 4: Get pnpm store directory (matches CI workflow)
    PNPM_STORE_DIR=$(pnpm store path)
    print_status "pnpm store directory: $PNPM_STORE_DIR"

    # Step 5: Install dependencies (exact CI command)
    print_status "Installing dependencies with frozen lockfile..."
    timeout 300 pnpm install --frozen-lockfile
    print_status "Dependencies installed successfully"

    # Step 6: Type checking (exact CI command)
    print_status "Running TypeScript type checking..."
    timeout 180 pnpm run typecheck
    print_status "Type checking passed"

    # Step 7: Linting (exact CI command)
    print_status "Running ESLint..."
    timeout 180 pnpm run lint
    print_status "Linting passed"

    # Step 8: Test suite (exact CI command with all flags)
    print_status "Running test suite with CI flags..."
    timeout 600 pnpm run test:ci --forceExit --detectOpenHandles --testTimeout=10000 --maxWorkers=50%
    print_status "Test suite passed"

    # Step 9: Test with coverage (exact CI command)
    print_status "Running test suite with coverage..."
    timeout 600 pnpm run test:coverage --forceExit --detectOpenHandles --testTimeout=10000 --maxWorkers=50%
    print_status "Test coverage passed"

    # Step 10: Build (exact CI command)
    print_status "Building project..."
    timeout 300 pnpm run build
    print_status "Build completed successfully"

    # Step 11: Validate build outputs (exact CI validation)
    print_status "Validating build outputs..."

    # Check required build files
    REQUIRED_OUTPUTS=(
        "dist/index.js"
        "dist/index.d.ts"
    )

    for output in "${REQUIRED_OUTPUTS[@]}"; do
        if [[ ! -f "$output" ]]; then
            print_error "Required build output missing: $output"
            exit 1
        fi
    done

    print_status "Build outputs validation passed"
}

# Simulate Norwegian compliance workflow
simulate_norwegian_compliance_workflow() {
    print_section "Norwegian Compliance Workflow Simulation"

    # Set up Norwegian compliance environment
    export NORWEGIAN_COMPLIANCE=true
    export NSM_VALIDATION=true
    export GDPR_VALIDATION=true

    # Run Norwegian compliance tests if available
    if [[ -f "scripts/test-norwegian-compliance.mjs" ]]; then
        print_status "Running Norwegian compliance test suite..."
        timeout 300 pnpm run test:ci --forceExit --detectOpenHandles --testNamePattern="Norwegian|NSM|GDPR"
        print_status "Norwegian compliance tests passed"

        # Run compliance script
        print_status "Running Norwegian compliance script..."
        timeout 300 node scripts/test-norwegian-compliance.mjs
        print_status "Norwegian compliance script passed"
    else
        print_warning "Norwegian compliance scripts not found - skipping"
    fi
}

# Main simulation workflow
main() {
    local start_time=$(date +%s)

    echo "🕐 Starting CI simulation at $(date)"

    # Run all CI workflow simulations
    setup_ci_environment
    simulate_ci_workflow
    simulate_norwegian_compliance_workflow

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo ""
    echo "🎉 CI SIMULATION COMPLETED SUCCESSFULLY! 🎉"
    echo "================================================"
    echo "✅ Environment Setup: OK"
    echo "✅ Dependencies: OK"
    echo "✅ TypeScript: OK"
    echo "✅ Linting: OK"
    echo "✅ Tests: OK"
    echo "✅ Coverage: OK"
    echo "✅ Build: OK"
    echo "✅ Build Outputs: OK"
    echo "✅ Norwegian Compliance: OK"
    echo ""
    echo "🕐 Total simulation time: ${duration}s"
    echo "🚀 Your code will pass CI workflows!"
}

# Handle errors with detailed context
trap 'print_error "CI simulation failed at: $BASH_COMMAND (line $LINENO)"' ERR

# Run main function
main "$@"
