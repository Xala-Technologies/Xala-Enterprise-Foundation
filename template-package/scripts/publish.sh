#!/bin/bash

# {{PACKAGE_NAME}} - Publish Script
# Simple script for publishing to GitHub Packages

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PACKAGE_NAME="{{PACKAGE_NAME}}"
REGISTRY_URL="https://npm.pkg.github.com"

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    log_info "Loading environment variables from .env file..."
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
fi

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Simulate the publish process without actually publishing"
    echo "  --help       Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  NODE_AUTH_TOKEN    GitHub Personal Access Token for publishing"
    echo ""
    echo "Configuration:"
    echo "  Create a .env file in the project root with:"
    echo "  NODE_AUTH_TOKEN=your_github_personal_access_token"
    echo ""
    echo "Examples:"
    echo "  $0                # Publish package (reads .env file)"
    echo "  $0 --dry-run      # Test publish process"
    echo ""
    echo "  # Alternative - set environment variable directly:"
    echo "  NODE_AUTH_TOKEN=<token> $0"
    echo ""
    echo "Prerequisites:"
    echo "1. Package must be built (run 'pnpm run build')"
    echo "2. All tests must pass (run 'pnpm run validate')"
    echo "3. NODE_AUTH_TOKEN must be set (via .env file or environment variable)"
    echo "4. GitHub Personal Access Token needs 'packages:write' permission"
    echo ""
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run this script from the project root."
    fi

    # Check if this is the correct package
    CURRENT_PACKAGE=$(pnpm exec node -p "require('./package.json').name" 2>/dev/null || echo "")
    if [ "$CURRENT_PACKAGE" != "$PACKAGE_NAME" ]; then
        log_error "This script is for $PACKAGE_NAME but found: $CURRENT_PACKAGE"
    fi

    # Check required tools
    command -v node >/dev/null 2>&1 || log_error "Node.js is required but not installed."
    command -v pnpm >/dev/null 2>&1 || log_error "pnpm is required but not installed."

    # Check if package is built
    if [ ! -f "dist/index.js" ] || [ ! -f "dist/index.d.ts" ]; then
        log_error "Package is not built. Please run 'pnpm run build' first."
    fi

    # Check NODE_AUTH_TOKEN
    if [ -z "$NODE_AUTH_TOKEN" ]; then
        if [ -f ".env" ]; then
            log_error "NODE_AUTH_TOKEN not found in .env file. Please add: NODE_AUTH_TOKEN=your_github_token"
        else
            log_error "NODE_AUTH_TOKEN environment variable is required. Create a .env file with: NODE_AUTH_TOKEN=your_github_token"
        fi
    fi

    log_success "All prerequisites met"
}

validate_package() {
    log_info "Validating package..."

    # Get package version
    PACKAGE_VERSION=$(pnpm exec node -p "require('./package.json').version")
    log_info "Package version: $PACKAGE_VERSION"

    # Validate package can be packed
    log_info "Testing package creation..."
    # Test that pack would work by checking package.json validity
    pnpm exec node -e "
        const pkg = require('./package.json');
        if (!pkg.name || !pkg.version || !pkg.main || !pkg.types) {
            throw new Error('Invalid package.json structure');
        }
        console.log('✅ Package structure valid');
    " || log_error "Package cannot be created"

    # Test package functionality - use ESM imports for compatibility
    log_info "Validating package functionality..."
    pnpm exec node -e "
        import('./dist/index.esm.js').then(pkg => {
            // Basic functionality test - adapt this to your package's main exports
            console.log('✅ Package functionality validated');
        }).catch(error => {
            console.error('❌ Package validation failed:', error.message);
            process.exit(1);
        });
    " || log_error "Package validation failed"

    log_success "Package validation passed"
}

setup_npm_config() {
    log_info "Setting up npm configuration for GitHub Packages..."

    # Backup existing .npmrc if it exists
    if [ -f ".npmrc" ]; then
        cp .npmrc .npmrc.backup
        log_info "Backed up existing .npmrc"
    fi

    # Create .npmrc for GitHub Packages - use organization from package name
    ORG_NAME=$(echo "$PACKAGE_NAME" | cut -d'/' -f1)
    cat > .npmrc << EOF
${ORG_NAME}:registry=$REGISTRY_URL
$REGISTRY_URL/:_authToken=\${NODE_AUTH_TOKEN}
EOF

    log_success "npm configuration updated"
}

restore_npm_config() {
    log_info "Restoring npm configuration..."

    # Remove GitHub Packages .npmrc
    rm -f .npmrc

    # Restore backup if it exists
    if [ -f ".npmrc.backup" ]; then
        mv .npmrc.backup .npmrc
        log_info "Restored original .npmrc"
    fi

    log_success "npm configuration restored"
}

publish_package() {
    local dry_run="$1"

    if [ "$dry_run" = "true" ]; then
        log_info "Performing dry run..."

        # Test pack without actually creating the file
        log_info "Simulating package creation..."
        pnpm exec node -e "
            const pkg = require('./package.json');
            const fs = require('fs');

            // Check required files exist
            const requiredFiles = ['dist/index.js', 'dist/index.d.ts', 'README.md', 'LICENSE'];
            requiredFiles.forEach(file => {
                if (!fs.existsSync(file)) {
                    throw new Error(\`Required file missing: \${file}\`);
                }
            });

            console.log('✅ Package would be created successfully');
            console.log(\`📦 Package: \${pkg.name}@\${pkg.version}\`);
            console.log(\`📄 Files: \${pkg.files.join(', ')}\`);
        " || log_error "Package simulation failed"

        log_success "Dry run completed successfully"
        log_info "Package would be published to: $REGISTRY_URL"
        return
    fi

    log_info "Publishing package to GitHub Packages..."

    # Get package details
    PACKAGE_VERSION=$(pnpm exec node -p "require('./package.json').version")

    # Publish package
    pnpm publish --registry $REGISTRY_URL --access restricted || {
        log_error "Publishing failed"
    }

    log_success "Package published successfully!"
    log_success "Package: $PACKAGE_NAME@$PACKAGE_VERSION"
    log_success "Registry: $REGISTRY_URL"

    echo ""
    echo "📦 Installation Instructions:"
    echo "pnpm add $PACKAGE_NAME@$PACKAGE_VERSION"
    echo ""
    echo "🔗 Package URL:"
    echo "https://github.com/{{GITHUB_ORG}}/{{PACKAGE_REPO}}/packages"
}

cleanup() {
    # Restore npm config on exit
    restore_npm_config || true
}

# Set up cleanup trap
trap cleanup EXIT

# Parse command line arguments
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            print_usage
            exit 0
            ;;
        -*)
            log_error "Unknown option: $1"
            ;;
        *)
            log_error "Unexpected argument: $1"
            ;;
    esac
done

# Main execution
main() {
    echo ""
    echo "========================================"
    echo "📦 {{PACKAGE_DISPLAY_NAME}} Publisher"
    echo "========================================"
    echo "Package: $PACKAGE_NAME"
    echo "Registry: $REGISTRY_URL"

    if [ "$DRY_RUN" = "true" ]; then
        echo "Mode: DRY RUN"
    else
        echo "Mode: PUBLISH"
    fi
    echo "========================================"
    echo ""

    # Execute publishing steps
    check_prerequisites
    validate_package
    setup_npm_config
    publish_package "$DRY_RUN"

    echo ""
    echo "========================================"
    if [ "$DRY_RUN" = "true" ]; then
        echo "🧪 Dry run completed successfully!"
        echo "Run without --dry-run to actually publish."
    else
        echo "🎉 Publishing completed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Verify package at: https://github.com/{{GITHUB_ORG}}/{{PACKAGE_REPO}}/packages"
        echo "2. Test installation in a new project"
        echo "3. Update documentation if needed"
    fi
    echo "========================================"
}

# Run main function
main
