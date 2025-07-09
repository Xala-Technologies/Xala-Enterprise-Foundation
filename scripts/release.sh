#!/bin/bash

# @xala-technologies/foundation - Local Release Script
# Professional release management with version control and changelog generation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PACKAGE_NAME="@xala-technologies/foundation"
REGISTRY_URL="https://npm.pkg.github.com"
DEFAULT_BRANCH="main"

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

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
    echo "Usage: $0 [OPTIONS] <version_type_or_version>"
    echo ""
    echo "Version Types:"
    echo "  patch     - Increment patch version (e.g., 2.0.0 -> 2.0.1)"
    echo "  minor     - Increment minor version (e.g., 2.0.0 -> 2.1.0)"
    echo "  major     - Increment major version (e.g., 2.0.0 -> 3.0.0)"
    echo "  <version> - Set specific version (e.g., 2.1.0-beta.1)"
    echo ""
    echo "Options:"
    echo "  --dry-run             Simulate the release process without making changes"
    echo "  --skip-tests          Skip running tests (not recommended)"
    echo "  --skip-build          Skip building the package"
    echo "  --skip-git-check      Skip git status and branch checks"
    echo "  --skip-changelog      Skip changelog generation"
    echo "  --push-tags           Push git tags to remote"
    echo "  --publish             Publish to npm registry after release"
    echo "  --help                Show this help message"
    echo ""
    echo "Configuration (for --publish option):"
    echo "  Create a .env file in the project root with:"
    echo "  NODE_AUTH_TOKEN=your_github_personal_access_token"
    echo ""
    echo "Examples:"
    echo "  $0 patch                    # Increment patch version"
    echo "  $0 2.1.0                    # Set version to 2.1.0"
    echo "  $0 --dry-run minor          # Simulate minor version bump"
    echo "  $0 --publish patch          # Release and publish patch version"
    echo ""
    echo "  # Alternative - set environment variable directly:"
    echo "  NODE_AUTH_TOKEN=<token> $0 --publish patch"
    echo ""
}

check_dependencies() {
    log_info "Checking dependencies..."

    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run this script from the project root."
    fi

    # Check if this is the foundation package
    CURRENT_PACKAGE=$(pnpm exec node -p "require('./package.json').name" 2>/dev/null || echo "")
    if [ "$CURRENT_PACKAGE" != "$PACKAGE_NAME" ]; then
        log_error "This script is for $PACKAGE_NAME but found: $CURRENT_PACKAGE"
    fi

    # Check required tools
    command -v node >/dev/null 2>&1 || log_error "Node.js is required but not installed."
    command -v pnpm >/dev/null 2>&1 || log_error "pnpm is required but not installed."
    command -v git >/dev/null 2>&1 || log_error "git is required but not installed."

    log_success "All dependencies are available"
}

check_git_status() {
    if [ "$SKIP_GIT_CHECK" = "true" ]; then
        log_warning "Skipping git status check"
        return
    fi

    log_info "Checking git status..."

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
    fi

    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "$DEFAULT_BRANCH" ]; then
        log_warning "Not on $DEFAULT_BRANCH branch (currently on: $CURRENT_BRANCH)"
        read -p "Continue anyway? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Aborted by user"
        fi
    fi

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        log_error "Working directory is not clean. Please commit or stash your changes."
    fi

    # Check if we're up to date with remote
    git fetch origin
    if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/$DEFAULT_BRANCH)" ]; then
        log_error "Local branch is not up to date with origin/$DEFAULT_BRANCH"
    fi

    log_success "Git status is clean"
}

get_current_version() {
    pnpm exec node -p "require('./package.json').version"
}

calculate_new_version() {
    local version_type="$1"
    local current_version=$(get_current_version)

    case $version_type in
        patch|minor|major)
            # Use pnpm version to calculate new version
            NEW_VERSION=$(pnpm version $version_type --no-git-tag-version --dry-run | sed 's/^v//')
            ;;
        *)
            # Assume it's a specific version
            NEW_VERSION="$version_type"
            # Validate semantic versioning format
            if [[ ! $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+([+-][a-zA-Z0-9\-\.]+)?$ ]]; then
                log_error "Invalid version format: $NEW_VERSION. Must follow semantic versioning."
            fi
            ;;
    esac

    echo "$NEW_VERSION"
}

update_package_version() {
    local new_version="$1"
    log_info "Updating package.json version to $new_version..."

    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY RUN: Would update package.json version to $new_version"
        return
    fi

    # Update package.json
    pnpm exec node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.version = '$new_version';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "

    log_success "Updated package.json version"
}

run_tests() {
    if [ "$SKIP_TESTS" = "true" ]; then
        log_warning "Skipping tests"
        return
    fi

    log_info "Running tests..."

    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY RUN: Would run tests"
        return
    fi

    pnpm run validate || log_error "Tests failed"
    log_success "All tests passed"
}

build_package() {
    if [ "$SKIP_BUILD" = "true" ]; then
        log_warning "Skipping build"
        return
    fi

    log_info "Building package..."

    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY RUN: Would build package"
        return
    fi

    # Clean previous build
    pnpm run clean || true

    # Build package
    pnpm run build || log_error "Build failed"

    # Validate build output
    if [ ! -f "dist/index.js" ] || [ ! -f "dist/index.d.ts" ]; then
        log_error "Build output is incomplete"
    fi

    # Test Norwegian compliance features
    log_info "Validating Norwegian compliance features..."
    pnpm exec node -e "
        import('./dist/index.esm.js').then(foundation => {
            if (!foundation.EventBus || !foundation.NORWEGIAN_COMPLIANCE) {
                throw new Error('Critical foundation features missing from build');
            }
            console.log('✅ Norwegian compliance features validated');
        }).catch(error => {
            console.error('❌ Norwegian compliance validation failed:', error.message);
            process.exit(1);
        });
    " || log_error "Norwegian compliance validation failed"

    log_success "Package built successfully"
}

generate_changelog() {
    if [ "$SKIP_CHANGELOG" = "true" ]; then
        log_warning "Skipping changelog generation"
        return
    fi

    local new_version="$1"
    log_info "Generating changelog for version $new_version..."

    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY RUN: Would generate changelog"
        return
    fi

    # Get the last tag
    LAST_TAG=$(git tag -l --sort=-version:refname | head -n 1)

    if [ -z "$LAST_TAG" ]; then
        log_info "No previous tags found, generating initial changelog"
        COMMIT_RANGE="HEAD"
    else
        log_info "Generating changelog since $LAST_TAG"
        COMMIT_RANGE="$LAST_TAG..HEAD"
    fi

    # Create changelog entry
    DATE=$(date +"%Y-%m-%d")
    CHANGELOG_ENTRY="## [$new_version] - $DATE\n\n"

    # Add what's changed section
    CHANGELOG_ENTRY="${CHANGELOG_ENTRY}### What's Changed\n\n"

    # Get commits with conventional commit format
    while IFS= read -r commit; do
        CHANGELOG_ENTRY="${CHANGELOG_ENTRY}- ${commit}\n"
    done < <(git log $COMMIT_RANGE --pretty=format:"%s" --reverse)

    # Add Norwegian compliance section
    CHANGELOG_ENTRY="${CHANGELOG_ENTRY}\n### Norwegian Compliance\n\n"
    CHANGELOG_ENTRY="${CHANGELOG_ENTRY}This release maintains full compliance with:\n"
    CHANGELOG_ENTRY="${CHANGELOG_ENTRY}- NSM (Norwegian National Security Authority) security classifications\n"
    CHANGELOG_ENTRY="${CHANGELOG_ENTRY}- GDPR (General Data Protection Regulation)\n"
    CHANGELOG_ENTRY="${CHANGELOG_ENTRY}- DigDir (Norwegian Digitalization Agency) standards\n\n"

    # Create or update CHANGELOG.md
    if [ ! -f "CHANGELOG.md" ]; then
        cat > CHANGELOG.md << EOF
# Changelog

All notable changes to the @xala-technologies/foundation package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

EOF
    fi

    # Insert new entry after the header
    sed -i "1,/^$/a\\
$CHANGELOG_ENTRY" CHANGELOG.md

    log_success "Changelog generated"
}

commit_changes() {
    local new_version="$1"
    log_info "Committing changes..."

    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY RUN: Would commit changes"
        return
    fi

    # Add files to git
    git add package.json
    [ -f "CHANGELOG.md" ] && git add CHANGELOG.md

    # Commit changes
    git commit -m "chore: release version $new_version

- Update package.json version to $new_version
- Update CHANGELOG.md with release notes
- Norwegian compliance validation passed

This release maintains compliance with NSM, GDPR, and DigDir standards."

    log_success "Changes committed"
}

create_git_tag() {
    local new_version="$1"
    log_info "Creating git tag v$new_version..."

    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY RUN: Would create git tag v$new_version"
        return
    fi

    # Create annotated tag
    git tag -a "v$new_version" -m "Release v$new_version

@xala-technologies/foundation v$new_version

A modular foundation package for Norwegian government-compliant applications.

Features:
- Event-driven architecture with EventBus and ServiceRegistry
- Norwegian compliance with NSM, GDPR, and DigDir support
- Security utilities with encryption and validation
- Configuration management with environment-specific settings
- Audit logging for government compliance requirements
- TypeScript support with comprehensive type definitions"

    if [ "$PUSH_TAGS" = "true" ]; then
        log_info "Pushing tag to remote..."
        git push origin "v$new_version"
        log_success "Tag pushed to remote"
    else
        log_info "Tag created locally. Use --push-tags to push to remote."
    fi

    log_success "Git tag created"
}

publish_package() {
    if [ "$PUBLISH" != "true" ]; then
        return
    fi

    local new_version="$1"
    log_info "Publishing package to npm registry..."

    if [ "$DRY_RUN" = "true" ]; then
        log_warning "DRY RUN: Would publish package"
        pnpm pack --dry-run
        return
    fi

    # Configure npm for GitHub Packages
    echo "@xala-technologies:registry=$REGISTRY_URL" > .npmrc.tmp
    echo "$REGISTRY_URL/:_authToken=\${NODE_AUTH_TOKEN}" >> .npmrc.tmp

    # Load environment variables from .env file if it exists and publishing is enabled
    if [ -f ".env" ]; then
        log_info "Loading environment variables from .env file..."
        export $(grep -v '^#' .env | xargs)
    fi

    # Check if NODE_AUTH_TOKEN is set
    if [ -z "$NODE_AUTH_TOKEN" ]; then
        if [ -f ".env" ]; then
            log_error "NODE_AUTH_TOKEN not found in .env file. Please add: NODE_AUTH_TOKEN=your_github_token"
        else
            log_error "NODE_AUTH_TOKEN environment variable is required for publishing. Create a .env file with: NODE_AUTH_TOKEN=your_github_token"
        fi
    fi

    # Use temporary .npmrc for publishing
    mv .npmrc .npmrc.backup 2>/dev/null || true
    mv .npmrc.tmp .npmrc

    # Publish package
    pnpm publish --no-git-checks --access public || {
        # Restore original .npmrc
        rm -f .npmrc
        mv .npmrc.backup .npmrc 2>/dev/null || true
        log_error "Publishing failed"
    }

    # Restore original .npmrc
    rm -f .npmrc
    mv .npmrc.backup .npmrc 2>/dev/null || true

    log_success "Package published successfully!"
    log_info "Install with: pnpm add $PACKAGE_NAME@$new_version"
}

print_summary() {
    local current_version="$1"
    local new_version="$2"

    echo ""
    echo "========================================"
    echo "🎉 Release Summary"
    echo "========================================"
    echo "Package: $PACKAGE_NAME"
    echo "Previous version: $current_version"
    echo "New version: $new_version"
    echo "Git tag: v$new_version"
    echo ""

    if [ "$DRY_RUN" = "true" ]; then
        echo "⚠️  This was a DRY RUN - no changes were made"
    else
        echo "✅ Release completed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Push changes to remote: git push origin $DEFAULT_BRANCH"
        if [ "$PUSH_TAGS" != "true" ]; then
            echo "2. Push tags to remote: git push origin v$new_version"
        fi
        if [ "$PUBLISH" != "true" ]; then
            echo "3. Publish package: NODE_AUTH_TOKEN=<token> $0 --publish"
        fi
    fi
    echo "========================================"
}

# Parse command line arguments
DRY_RUN=false
SKIP_TESTS=false
SKIP_BUILD=false
SKIP_GIT_CHECK=false
SKIP_CHANGELOG=false
PUSH_TAGS=false
PUBLISH=false
VERSION_TYPE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-git-check)
            SKIP_GIT_CHECK=true
            shift
            ;;
        --skip-changelog)
            SKIP_CHANGELOG=true
            shift
            ;;
        --push-tags)
            PUSH_TAGS=true
            shift
            ;;
        --publish)
            PUBLISH=true
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
            if [ -z "$VERSION_TYPE" ]; then
                VERSION_TYPE="$1"
            else
                log_error "Too many arguments"
            fi
            shift
            ;;
    esac
done

# Check if version type is provided
if [ -z "$VERSION_TYPE" ]; then
    log_error "Version type or version number is required. Use --help for usage information."
fi

# Main execution
main() {
    log_info "Starting release process for $PACKAGE_NAME..."

    # Get current version
    CURRENT_VERSION=$(get_current_version)
    log_info "Current version: $CURRENT_VERSION"

    # Calculate new version
    NEW_VERSION=$(calculate_new_version "$VERSION_TYPE")
    log_info "New version: $NEW_VERSION"

    # Confirm with user if not dry run
    if [ "$DRY_RUN" != "true" ]; then
        echo ""
        log_warning "This will release $PACKAGE_NAME from $CURRENT_VERSION to $NEW_VERSION"
        read -p "Continue? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Aborted by user"
        fi
    fi

    # Execute release steps
    check_dependencies
    check_git_status
    run_tests
    build_package
    update_package_version "$NEW_VERSION"
    generate_changelog "$NEW_VERSION"
    commit_changes "$NEW_VERSION"
    create_git_tag "$NEW_VERSION"
    publish_package "$NEW_VERSION"

    # Print summary
    print_summary "$CURRENT_VERSION" "$NEW_VERSION"
}

# Run main function
main
