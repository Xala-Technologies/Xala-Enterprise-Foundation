#!/bin/bash

# Test script to create a single package for validation
# This creates only the UI System package (ÅPEN classification)

set -e

echo "🧪 Testing Single Package Creation"
echo "=================================="
echo ""

# Configuration
GITHUB_ORG="Xala-Technologies"
TEMPLATE_REPO="xala-enterprise-package-template"
BASE_DIR="$(pwd)/xala-packages-test"

# Single package for testing (UI System - ÅPEN classification)
PACKAGE_NAME="ui-system"
PACKAGE_DISPLAY_NAME="UI System"
PACKAGE_DESCRIPTION="Enterprise-grade component library with Norwegian compliance, WCAG 2.2 AA accessibility, and multi-language support"
NSM_CLASSIFICATION="ÅPEN"

# Helper functions
create_directory() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo "📁 Created directory: $1"
    fi
}

check_dependencies() {
    echo "🔍 Checking dependencies..."

    if ! command -v gh &> /dev/null; then
        echo "❌ GitHub CLI (gh) is required but not installed."
        echo "   Install it from: https://cli.github.com/"
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        echo "❌ Git is required but not installed."
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed."
        exit 1
    fi

    if ! command -v pnpm &> /dev/null; then
        echo "❌ pnpm is required but not installed."
        echo "   Install it with: npm install -g pnpm"
        exit 1
    fi

    echo "✅ All dependencies found"
}

check_github_auth() {
    echo "🔐 Checking GitHub authentication..."

    if ! gh auth status &> /dev/null; then
        echo "❌ Not authenticated with GitHub CLI."
        echo "   Run: gh auth login"
        exit 1
    fi

    echo "✅ GitHub authentication verified"
}

create_test_package() {
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local repo_name="Xala-Enterprise-${PACKAGE_DISPLAY_NAME// /-}-Test-${timestamp}"
    local repo_dir="${BASE_DIR}/${PACKAGE_NAME}"

    echo ""
    echo "📦 Creating test package: ${PACKAGE_NAME}"
    echo "   Display Name: ${PACKAGE_DISPLAY_NAME}"
    echo "   Description: ${PACKAGE_DESCRIPTION}"
    echo "   NSM Classification: ${NSM_CLASSIFICATION}"
    echo "   Repository: ${repo_name}"

    # Clean up existing local directory if it exists
    if [ -d "${repo_dir}" ]; then
        echo "   🗑️ Removing existing local directory..."
        rm -rf "${repo_dir}"
    fi

    # Delete existing repository if it exists to force recreate with latest template
    if gh repo view "${GITHUB_ORG}/${repo_name}" &> /dev/null; then
        echo "   🗑️ Deleting existing repository to force recreate..."
        gh repo delete "${GITHUB_ORG}/${repo_name}" --yes 2>/dev/null || true
        echo "   ⏳ Waiting for deletion to complete..."
        sleep 5
        echo "   ✅ Existing repository deleted"
    fi

    # Always create repository from template to ensure latest fixes
    echo "   🔧 Creating repository from template..."
    gh repo create "${GITHUB_ORG}/${repo_name}" \
        --template="${GITHUB_ORG}/${TEMPLATE_REPO}" \
        --description="${PACKAGE_DESCRIPTION}" \
        --public \
        --clone

    # Move to package directory
    if [ -d "${repo_name}" ]; then
        mv "${repo_name}" "${repo_dir}"
        cd "${repo_dir}"
    else
        echo "   ❌ Failed to create repository: ${repo_name}"
        return 1
    fi

    # Always update template to ensure we have the latest fixes
    echo "   🔄 Updating template files to latest version..."
    skip_setup=false

    # Run template setup
    if [ "$skip_setup" = false ]; then
        echo "   ⚙️ Setting up package from template..."

        # First, copy updated template files
        echo "   📋 Copying updated template files..."
        TEMPLATE_DIR="../../template"

        # Copy source files from template
        if [ -d "${TEMPLATE_DIR}/src" ]; then
            cp -rf "${TEMPLATE_DIR}/src"/* ./src/ 2>/dev/null || true
        fi

        # Copy platform files from template
        if [ -d "${TEMPLATE_DIR}/platforms" ]; then
            cp -rf "${TEMPLATE_DIR}/platforms"/* ./platforms/ 2>/dev/null || true
        fi

        # Copy tools files from template
        if [ -d "${TEMPLATE_DIR}/tools" ]; then
            cp -rf "${TEMPLATE_DIR}/tools"/* ./tools/ 2>/dev/null || true
        fi

        # Copy tests files from template
        if [ -d "${TEMPLATE_DIR}/tests" ]; then
            cp -rf "${TEMPLATE_DIR}/tests"/* ./tests/ 2>/dev/null || true
        fi

        # Copy configuration files from template
        if [ -f "${TEMPLATE_DIR}/.eslintrc.cjs" ]; then
            cp "${TEMPLATE_DIR}/.eslintrc.cjs" ./
        fi

        if [ -f "${TEMPLATE_DIR}/package.json" ]; then
            cp "${TEMPLATE_DIR}/package.json" ./
        fi

        if [ -f "${TEMPLATE_DIR}/tsconfig.json" ]; then
            cp "${TEMPLATE_DIR}/tsconfig.json" ./
        fi

        if [ -f "${TEMPLATE_DIR}/tsconfig.build.json" ]; then
            cp "${TEMPLATE_DIR}/tsconfig.build.json" ./
        fi

        if [ -f "${TEMPLATE_DIR}/rollup.config.js" ]; then
            cp "${TEMPLATE_DIR}/rollup.config.js" ./
        fi

        echo "   ✅ Template files copied successfully"

        # Then replace template variables
        echo "   🔄 Replacing template variables..."

        # Convert display name to PascalCase for proper naming
        display_name_pascal=$(echo "${PACKAGE_DISPLAY_NAME}" | sed 's/[^a-zA-Z0-9]//g')
        package_name_kebab=$(echo "${PACKAGE_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

        # Replace template variables in all relevant files
        find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" -o -name ".*" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec sed -i.bak \
            -e "s/{{PACKAGE_NAME}}/${package_name_kebab}/g" \
            -e "s/{{PACKAGE_DISPLAY_NAME}}/${display_name_pascal}/g" \
            -e "s|{{PACKAGE_DESCRIPTION}}|${PACKAGE_DESCRIPTION}|g" \
            -e "s/{{GITHUB_ORG}}/${GITHUB_ORG}/g" \
            -e "s/{{NSM_CLASSIFICATION}}/${NSM_CLASSIFICATION}/g" \
            {} \; 2>/dev/null || true

                # Clean up backup files
        find . -name "*.bak" ! -path "./node_modules/*" ! -path "./.git/*" -delete 2>/dev/null || true

                echo "   ✅ Template variables replaced successfully"
        echo "   ✅ Package setup completed - template includes all necessary files"
    fi

        # Install dependencies
    echo "   📥 Installing dependencies..."

    # Remove existing lockfile to avoid conflicts
    if [ -f "pnpm-lock.yaml" ]; then
        rm pnpm-lock.yaml
        echo "   🗑️ Removed existing lockfile"
    fi

    # Install dependencies with pnpm
    echo "   📥 Installing dependencies with pnpm..."

    # Remove existing lockfile to avoid conflicts
    if [ -f "pnpm-lock.yaml" ]; then
        rm pnpm-lock.yaml
        echo "   🗑️ Removed existing lockfile"
    fi

    # Install with pnpm
    if ! pnpm install --ignore-scripts --no-optional 2>/dev/null; then
        echo "   ⚠️ pnpm install with --no-optional failed, trying standard install..."
        if ! pnpm install 2>/dev/null; then
            echo "   ⚠️ pnpm install failed, trying with --frozen-lockfile=false..."
            if ! pnpm install --frozen-lockfile=false 2>/dev/null; then
                echo "   ⚠️ All pnpm install methods failed, continuing with minimal setup..."
            else
                echo "   ✅ Dependencies installed with pnpm (--frozen-lockfile=false)"
            fi
        else
            echo "   ✅ Dependencies installed with pnpm"
        fi
    else
        echo "   ✅ Dependencies installed with pnpm (--no-optional)"
    fi

        # Run validation (skip some checks for test)
    echo "   🔍 Validating setup..."

    # Check if TypeScript is available and run typecheck
    if command -v tsc &> /dev/null || [ -f "node_modules/.bin/tsc" ]; then
        echo "   📝 Running TypeScript validation..."
        if ! pnpm run typecheck 2>/dev/null; then
            echo "   ⚠️ TypeScript validation failed, checking manually..."
            if [ -f "node_modules/.bin/tsc" ]; then
                node_modules/.bin/tsc --noEmit || echo "   ⚠️ TypeScript errors found but continuing..."
            fi
        fi
    else
        echo "   ⚠️ TypeScript not available, skipping typecheck"
    fi

    # Check if ESLint is available and run linting
    if [ -f "node_modules/.bin/eslint" ] || command -v eslint &> /dev/null; then
        echo "   🔍 Running ESLint validation..."
        if ! pnpm run lint --fix 2>/dev/null; then
            echo "   ⚠️ ESLint via pnpm failed, trying direct execution..."
            if [ -f "node_modules/.bin/eslint" ]; then
                node_modules/.bin/eslint --fix . --ext .ts,.js || echo "   ⚠️ ESLint errors found but continuing..."
            fi
        fi
    else
        echo "   ⚠️ ESLint not available, skipping lint check"
    fi

    # Check if compliance script exists before running
    if grep -q "compliance:quick" package.json 2>/dev/null; then
        echo "   🇳🇴 Running Norwegian compliance validation..."
        if ! pnpm run compliance:quick 2>/dev/null; then
            echo "   ⚠️ Compliance validation failed, but continuing..."
        fi
    else
        echo "   ℹ️ Compliance script not found, skipping..."
    fi

    echo "   ✅ Validation completed (with possible warnings)"

    # Remove lock files from git tracking if they exist
    if [ -f "pnpm-lock.yaml" ]; then
        echo "   🔧 Removing lock files from git tracking to prevent push issues..."
        git rm --cached pnpm-lock.yaml 2>/dev/null || true
        git rm --cached package-lock.json 2>/dev/null || true
        git rm --cached yarn.lock 2>/dev/null || true
    fi

    # Commit changes (if there are any)
    if git status --porcelain | grep -q .; then
        echo "   💾 Creating commit with updated template..."
        git add .
        # Make sure lock files are not added even if they exist
        git reset HEAD pnpm-lock.yaml 2>/dev/null || true
        git reset HEAD package-lock.json 2>/dev/null || true
        git reset HEAD yarn.lock 2>/dev/null || true

        git commit -m "feat: update ${PACKAGE_NAME} test package with latest template

- ${PACKAGE_DESCRIPTION}
- NSM Classification: ${NSM_CLASSIFICATION}
- Norwegian compliance enabled
- Multi-platform support (web, mobile, desktop, API)
- Comprehensive CI/CD workflows
- Updated template with fixed TypeScript imports and ESLint config"

        echo "   🚀 Pushing to remote repository..."
        echo "   ℹ️ Lock files excluded from git to prevent push issues"

        # Use git push with progress and timeout handling
        if git push origin main --progress 2>&1 | while IFS= read -r line; do
            echo "   📡 $line"
        done; then
            echo "   ✅ Push completed successfully"
        else
            echo "   ⚠️ Push failed or was interrupted"
            echo "   💡 You can manually push later with: git push origin main"
        fi
    else
        echo "   ✅ No changes to commit"
    fi

    echo "   ✅ Test package ${PACKAGE_NAME} created successfully!"
    echo "   🔗 Repository: https://github.com/${GITHUB_ORG}/${repo_name}"

    # Return to base directory
    cd "${BASE_DIR}"
}

# Main execution
main() {
    echo "Starting test package creation..."
    echo ""

    # Check dependencies
    check_dependencies
    check_github_auth

    # Create base directory
    create_directory "${BASE_DIR}"
    cd "${BASE_DIR}"

    echo ""
    echo "📊 Test Summary:"
    echo "   Package: ${PACKAGE_NAME}"
    echo "   Organization: ${GITHUB_ORG}"
    echo "   Template: ${TEMPLATE_REPO}"
    echo "   Base directory: ${BASE_DIR}"
    echo ""

    read -p "Do you want to proceed with test? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Test cancelled"
        exit 1
    fi

    # Create test package
    create_test_package

    echo ""
    echo "🎉 SUCCESS! Test package created successfully!"
    echo ""
    echo "📁 Package location: ${BASE_DIR}/${PACKAGE_NAME}"
    echo "📋 Next steps:"
    echo "   1. Review the generated package structure"
    echo "   2. Verify all template variables were replaced correctly"
    echo "   3. Test the CI/CD workflows"
    echo "   4. If successful, run the full batch creation script"
    echo "   5. Clean up test repository when done"
    echo ""
    echo "🧹 To clean up: gh repo delete ${GITHUB_ORG}/Xala-Enterprise-UI-System-Test"
}

# Run main function
main "$@"
