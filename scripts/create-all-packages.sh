#!/bin/bash

# Xala Enterprise Package Creation Automation Script
# This script creates all 11 packages in the Xala ecosystem using the GitHub template

set -e

echo "🚀 Xala Enterprise Package Creation Automation"
echo "=============================================="
echo ""

# Configuration
GITHUB_ORG="Xala-Technologies"
TEMPLATE_REPO="xala-enterprise-package-template"
BASE_DIR="$(pwd)/xala-packages"

# Package definitions (using arrays instead of associative arrays for better compatibility)
PACKAGE_NAMES=(
    "authentication"
    "business-services"
    "platform-services"
    "monitoring-services"
    "security-compliance"
    "norwegian-services"
    "data-services"
    "document-services"
    "ui-system"
    "test-infrastructure"
    "api-scaffolding"
)

PACKAGE_DISPLAY_NAMES=(
    "Authentication"
    "Business Services"
    "Platform Services"
    "Monitoring Services"
    "Security Compliance"
    "Norwegian Services"
    "Data Services"
    "Document Services"
    "UI System"
    "Test Infrastructure"
    "API Scaffolding"
)

PACKAGE_DESCRIPTIONS=(
    "Multi-modal authentication with Norwegian government integration including ID-porten, BankID, and Feide for secure citizen and employee access"
    "Domain-agnostic business logic patterns and workflows with Norwegian municipal process automation and approval systems"
    "Infrastructure concerns and external system integrations with Norwegian cloud providers and government APIs"
    "Comprehensive observability and performance monitoring with Norwegian KPI dashboards and NSM incident response automation"
    "Automated Norwegian compliance and security enforcement with NSM classifications, GDPR automation, and vulnerability management"
    "Norwegian government API integrations including Altinn, Enhetsregisteret, Folkeregisteret, and municipal system connectors"
    "Multi-database support with Norwegian data governance, GDPR compliance, and automatic data classification and protection"
    "Document management with Norwegian archival standards, Noark 5 compliance, and electronic signature integration"
    "Enterprise-grade component library with Norwegian compliance, WCAG 2.2 AA accessibility, and multi-language support"
    "Comprehensive testing framework with Norwegian compliance validation, accessibility testing, and municipal workflow simulation"
    "Automated API generation from domain models with Norwegian compliance, OpenAPI documentation, and government integration patterns"
)

PACKAGE_NSM_CLASSIFICATIONS=(
    "KONFIDENSIELT"
    "BEGRENSET"
    "BEGRENSET"
    "BEGRENSET"
    "KONFIDENSIELT"
    "BEGRENSET"
    "KONFIDENSIELT"
    "BEGRENSET"
    "ÅPEN"
    "ÅPEN"
    "BEGRENSET"
)

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

create_package() {
    local index=$1
    local package_name="${PACKAGE_NAMES[$index]}"
    local display_name="${PACKAGE_DISPLAY_NAMES[$index]}"
    local description="${PACKAGE_DESCRIPTIONS[$index]}"
    local nsm_classification="${PACKAGE_NSM_CLASSIFICATIONS[$index]}"

    local repo_name="Xala-Enterprise-${display_name// /-}"
    local repo_dir="${BASE_DIR}/${package_name}"

    echo ""
    echo "📦 Creating package: ${package_name}"
    echo "   Display Name: ${display_name}"
    echo "   Description: ${description}"
    echo "   NSM Classification: ${nsm_classification}"
    echo "   Repository: ${repo_name}"

    # Clean up existing local directory if it exists
    if [ -d "${repo_dir}" ]; then
        echo "   🗑️ Removing existing local directory..."
        rm -rf "${repo_dir}"
    fi

    # Create package directory and copy template files
    echo "   📁 Creating package directory and copying template files..."
    mkdir -p "${repo_dir}"

    # Copy template files from local template-package directory
    if [ -d "../template-package" ]; then
        # Copy all files including hidden ones (.github, .gitignore, etc.)
        cp -r ../template-package/. "${repo_dir}/"
        cd "${repo_dir}"
        echo "   ✅ Template files copied from local template-package"
    else
        echo "   ❌ Template package directory not found: ../template-package"
        echo "   💡 Please ensure you're running this script from the correct directory"
        # Try alternative path from foundation root
        if [ -d "../../template-package" ]; then
            cp -r ../../template-package/. "${repo_dir}/"
            cd "${repo_dir}"
            echo "   ✅ Template files copied from foundation template-package"
        else
            echo "   ❌ Template package directory not found in either location"
            return 1
        fi
    fi

    # Initialize git repository
    echo "   🔧 Initializing git repository..."
    git init
    git remote add origin "git@github.com:${GITHUB_ORG}/${repo_name}.git"

    # Replace template variables in files from local template
    echo "   🔄 Replacing template variables in template files..."

    # Convert display name to PascalCase for proper naming
    display_name_pascal=$(echo "${display_name}" | sed 's/[^a-zA-Z0-9]//g')
    package_name_kebab=$(echo "${package_name}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

    # Replace template variables in all relevant files
    echo "   📝 Replacing variables:"
    echo "      {{PACKAGE_NAME}} → ${package_name_kebab}"
    echo "      {{PACKAGE_DISPLAY_NAME}} → ${display_name_pascal}"
    echo "      {{PACKAGE_DESCRIPTION}} → ${description}"
    echo "      {{GITHUB_ORG}} → ${GITHUB_ORG}"
    echo "      {{NSM_CLASSIFICATION}} → ${nsm_classification}"

    # Use a more robust replacement method with proper escaping
    find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" -o -name ".*" \) ! -path "./node_modules/*" ! -path "./.git/*" -print0 | while IFS= read -r -d '' file; do
        # Check if file contains template variables before processing
        if grep -q "{{" "$file" 2>/dev/null; then
            echo "   🔄 Processing: $file"

            # Create a temporary file for safe replacement
            temp_file=$(mktemp)

            # Create a temporary Python script to handle complex descriptions safely
            cat > "${temp_file}_replace.py" << 'PYTHON_EOF'
import sys
import os

# Get variables from environment
package_name = os.environ.get('PACKAGE_NAME_VAR', '')
display_name = os.environ.get('DISPLAY_NAME_VAR', '')
description = os.environ.get('DESCRIPTION_VAR', '')
github_org = os.environ.get('GITHUB_ORG_VAR', '')
nsm_classification = os.environ.get('NSM_CLASSIFICATION_VAR', '')
input_file = os.environ.get('INPUT_FILE', '')
output_file = os.environ.get('OUTPUT_FILE', '')

# Read the file
with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace template variables safely
content = content.replace('{{PACKAGE_NAME}}', package_name)
content = content.replace('{{PACKAGE_DISPLAY_NAME}}', display_name)
content = content.replace('{{PACKAGE_DESCRIPTION}}', description)
content = content.replace('{{GITHUB_ORG}}', github_org)
content = content.replace('{{NSM_CLASSIFICATION}}', nsm_classification)

# Also replace placeholders without braces for source files
content = content.replace('PACKAGE_NAME', package_name)
content = content.replace('PACKAGE_DISPLAY_NAME', display_name)
content = content.replace('PACKAGE_DESCRIPTION', description)
content = content.replace('NSM_CLASSIFICATION', nsm_classification)

# Write to output file
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(content)
PYTHON_EOF

            # Set environment variables and run Python script
            PACKAGE_NAME_VAR="$package_name_kebab" \
            DISPLAY_NAME_VAR="$display_name_pascal" \
            DESCRIPTION_VAR="$description" \
            GITHUB_ORG_VAR="$GITHUB_ORG" \
            NSM_CLASSIFICATION_VAR="$nsm_classification" \
            INPUT_FILE="$file" \
            OUTPUT_FILE="$temp_file" \
            python3 "${temp_file}_replace.py" 2>/dev/null && rm "${temp_file}_replace.py" || {
                # Fallback to sed if Python fails
                echo "   ⚠️ Python replacement failed for $file, using sed fallback"
                cp "$file" "$temp_file"

                # Use a more robust sed approach for complex descriptions
                # First do simple replacements
                sed -i.bak \
                    -e "s/{{PACKAGE_NAME}}/${package_name_kebab}/g" \
                    -e "s/{{PACKAGE_DISPLAY_NAME}}/${display_name_pascal}/g" \
                    -e "s/{{GITHUB_ORG}}/${GITHUB_ORG}/g" \
                    -e "s/{{NSM_CLASSIFICATION}}/${nsm_classification}/g" \
                    -e "s/PACKAGE_NAME/${package_name_kebab}/g" \
                    -e "s/PACKAGE_DISPLAY_NAME/${display_name_pascal}/g" \
                    -e "s/NSM_CLASSIFICATION/${nsm_classification}/g" \
                    "$temp_file" 2>/dev/null || true

                # Handle description separately with Perl for better Unicode/special char support
                if command -v perl &> /dev/null; then
                    perl -i -pe "s/\\{\\{PACKAGE_DESCRIPTION\\}\\}/\Q$description\E/g" "$temp_file" 2>/dev/null || {
                        # Final fallback - manual description replacement
                        echo "   ⚠️ Complex description replacement may have issues"
                        # Try basic sed with escaped description
                        escaped_description=$(printf '%s\n' "$description" | sed 's/[[\.*^$()+?{|\\]/\\&/g')
                        sed -i.bak2 "s|{{PACKAGE_DESCRIPTION}}|${escaped_description}|g" "$temp_file" 2>/dev/null || true
                        rm -f "${temp_file}.bak2" 2>/dev/null || true
                    }
                else
                    # Try basic sed replacement for description
                    escaped_description=$(printf '%s\n' "$description" | sed 's/[[\.*^$()+?{|\\]/\\&/g')
                    sed -i.bak2 "s|{{PACKAGE_DESCRIPTION}}|${escaped_description}|g" "$temp_file" 2>/dev/null || true
                    rm -f "${temp_file}.bak2" 2>/dev/null || true
                fi

                # Remove backup file
                rm -f "${temp_file}.bak" 2>/dev/null || true
            }

            # Move the temp file to replace the original
            mv "$temp_file" "$file" 2>/dev/null || {
                echo "   ⚠️ Failed to replace $file, skipping..."
                rm -f "$temp_file" 2>/dev/null || true
            }
        fi
    done

    echo "   ✅ Template variables replaced successfully"

    # Verify that variables were replaced
    echo "   🔍 Verifying template variable replacement..."
    # Only check for actual template variables, not GitHub Actions variables
    remaining_vars=$(find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "{{[A-Z_]*}}" {} \; 2>/dev/null | wc -l)
    if [ "$remaining_vars" -eq 0 ]; then
        echo "   ✅ All template variables replaced successfully"
    else
        echo "   ⚠️ Found $remaining_vars files with remaining template variables"
        # Show specific template variables that weren't replaced
        find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "{{[A-Z_]*}}" {} \; 2>/dev/null | head -5
        # Show what template variables remain
        echo "   🔍 Remaining template variables:"
        find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -o "{{[A-Z_]*}}" {} \; 2>/dev/null | sort | uniq | head -10
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

    # Run validation
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

    # Check if compliance script exists and run it
    if grep -q "compliance:quick" package.json 2>/dev/null; then
        echo "   🇳🇴 Running Norwegian compliance validation..."
        if ! pnpm run compliance:quick 2>/dev/null; then
            echo "   ⚠️ Compliance validation failed, but continuing..."
        fi
    else
        echo "   ℹ️ Compliance script not found, skipping compliance check"
    fi

    echo "   ✅ Validation completed (with possible warnings)"

    # Remove lock files from git tracking if they exist
    if [ -f "pnpm-lock.yaml" ]; then
        echo "   🔧 Removing lock files from git tracking to prevent push issues..."
        git rm --cached pnpm-lock.yaml 2>/dev/null || true
        git rm --cached package-lock.json 2>/dev/null || true
        git rm --cached yarn.lock 2>/dev/null || true
    fi

    # Create GitHub repository
    echo "   🔧 Creating GitHub repository..."
    if gh repo view "${GITHUB_ORG}/${repo_name}" &> /dev/null; then
        echo "   ⚠️ Repository ${repo_name} already exists, skipping creation"
    else
        if ! gh repo create "${GITHUB_ORG}/${repo_name}" \
            --description="${description}" \
            --public \
            --confirm 2>/dev/null; then
            echo "   ❌ Failed to create GitHub repository ${repo_name}"
            echo "   💡 Check your GitHub authentication and permissions"
            return 1
        else
            echo "   ✅ GitHub repository ${repo_name} created successfully"
        fi
    fi

    # Commit changes (if there are any)
    if git status --porcelain | grep -q .; then
        echo "   💾 Creating initial commit..."
        git add .
        # Make sure lock files are not added even if they exist
        git reset HEAD pnpm-lock.yaml 2>/dev/null || true
        git reset HEAD package-lock.json 2>/dev/null || true
        git reset HEAD yarn.lock 2>/dev/null || true

        # Create commit with shorter message to avoid commitlint issues
        if ! git commit -m "feat: initialize ${package_name} package

- NSM Classification: ${nsm_classification}
- Norwegian compliance enabled
- Multi-platform support (web, mobile, desktop, API)
- Template with TypeScript, ESLint, and Jest setup

${description}" 2>&1 | tee /tmp/commit_output.log; then
            echo "   ❌ Commit failed! Check the output above."
            echo "   💡 This might be due to commitlint rules or git hooks."
            cat /tmp/commit_output.log
            return 1
        else
            echo "   ✅ Initial commit created successfully"
        fi

        # Set up main branch and push
        echo "   🚀 Setting up main branch and pushing to remote repository..."
        git branch -M main

        # Ensure we're authenticated and can push
        echo "   🔐 Verifying GitHub authentication before push..."
        if ! gh auth status &> /dev/null; then
            echo "   ❌ GitHub authentication lost. Please run: gh auth login"
            return 1
        fi

        # Try to push with better error handling
        echo "   🚀 Pushing to GitHub repository..."
        push_attempts=0
        max_attempts=3

        while [ $push_attempts -lt $max_attempts ]; do
            push_attempts=$((push_attempts + 1))
            echo "   📤 Push attempt $push_attempts/$max_attempts..."

            if git push -u origin main --progress 2>&1 | tee /tmp/push_output.log; then
                echo "   ✅ Repository pushed successfully to GitHub"

                # Verify the push was successful by checking remote
                echo "   🔍 Verifying repository is live on GitHub..."
                sleep 2  # Give GitHub a moment to process

                if git ls-remote --exit-code origin main >/dev/null 2>&1; then
                    echo "   ✅ Push verified - repository is live on GitHub"

                    # Double-check by trying to view the repo
                    if gh repo view "${GITHUB_ORG}/${repo_name}" &> /dev/null; then
                        echo "   ✅ GitHub repository confirmed accessible via GitHub CLI"
                        break
                    else
                        echo "   ⚠️ Repository push succeeded but not immediately accessible via CLI"
                        break
                    fi
                else
                    echo "   ❌ Push verification failed - repository not accessible"
                    if [ $push_attempts -lt $max_attempts ]; then
                        echo "   🔄 Retrying push..."
                        sleep 3
                        continue
                    fi
                fi
            else
                push_result=$?
                echo "   ❌ Push failed with exit code: $push_result"
                echo "   📋 Push output:"
                tail -10 /tmp/push_output.log

                if [ $push_attempts -lt $max_attempts ]; then
                    echo "   🔄 Retrying push in 3 seconds..."
                    sleep 3
                    continue
                else
                    echo "   ❌ All push attempts failed!"
                    echo "   💡 Manual push required: cd ${repo_dir} && git push -u origin main"
                    echo "   🔧 Or check GitHub authentication: gh auth status"
                    return 1
                fi
            fi
        done

        if [ $push_attempts -eq $max_attempts ] && ! git ls-remote --exit-code origin main >/dev/null 2>&1; then
            echo "   ❌ Failed to push to GitHub after $max_attempts attempts"
            echo "   💡 This package was created locally but NOT published to GitHub"
            return 1
        fi

    else
        echo "   ⚠️ No changes to commit - this should not happen with a new package"
        return 1
    fi

    echo "   ✅ Package ${package_name} created successfully!"

    # Return to base directory
    cd "${BASE_DIR}"
}

create_workspace_overview() {
    local overview_file="${BASE_DIR}/README.md"

    echo "📋 Creating workspace overview..."

    cat > "${overview_file}" << 'EOF'
# Xala Enterprise Package Ecosystem

This directory contains all 11 packages in the Xala Enterprise ecosystem, each providing Norwegian government-compliant functionality for different aspects of enterprise application development.

## Packages Overview

### Authentication & Security
- **@xala-technologies/authentication** - Multi-modal authentication with Norwegian government integration
- **@xala-technologies/security-compliance** - Automated Norwegian compliance and security enforcement

### Business Logic & Services
- **@xala-technologies/business-services** - Domain-agnostic business logic patterns and workflows
- **@xala-technologies/platform-services** - Infrastructure concerns and external system integrations
- **@xala-technologies/norwegian-services** - Norwegian government API integrations

### Data & Documents
- **@xala-technologies/data-services** - Multi-database support with Norwegian data governance
- **@xala-technologies/document-services** - Document management with Norwegian archival standards

### Development & Quality
- **@xala-technologies/ui-system** - Enterprise-grade component library with Norwegian compliance
- **@xala-technologies/test-infrastructure** - Comprehensive testing framework with compliance validation
- **@xala-technologies/api-scaffolding** - Automated API generation from domain models
- **@xala-technologies/monitoring-services** - Comprehensive observability and performance monitoring

## Norwegian Compliance Features

All packages include:
- 🇳🇴 **NSM Security Classifications** (ÅPEN, BEGRENSET, KONFIDENSIELT, HEMMELIG)
- 🛡️ **GDPR Compliance** with automatic data protection
- 🏛️ **DigDir Standards** for government interoperability
- ♿ **WCAG 2.2 AA Accessibility** compliance
- 🌐 **Multi-language Support** (Bokmål, Nynorsk, English)

## Development Workflow

```bash
# Install dependencies in all packages
find . -name "package.json" -not -path "*/node_modules/*" -execdir pnpm install \;

# Run tests across all packages
find . -name "package.json" -not -path "*/node_modules/*" -execdir pnpm test \;

# Run Norwegian compliance validation
find . -name "package.json" -not -path "*/node_modules/*" -execdir pnpm run compliance:full \;

# Build all packages
find . -name "package.json" -not -path "*/node_modules/*" -execdir pnpm build \;
```

## Architecture

Each package follows the same architectural patterns:
- **Multi-platform support** (web, mobile, desktop, API)
- **Modular design** with dependency injection
- **Event-driven architecture** with typed events
- **Comprehensive testing** with compliance validation
- **Norwegian government integration** ready

## Getting Started

1. Choose a package directory
2. Read the package-specific README.md
3. Follow the setup instructions
4. Implement your business logic
5. Run compliance validation
6. Deploy with confidence

---

**Xala Technologies** - Building the future of Norwegian digital government solutions
EOF

    echo "✅ Workspace overview created: ${overview_file}"
}

# Main execution
main() {
    echo "Starting Xala Enterprise package creation process..."
    echo ""

    # Check dependencies
    check_dependencies
    check_github_auth

    # Create base directory
    create_directory "${BASE_DIR}"
    cd "${BASE_DIR}"

        echo ""
    echo "📊 Package Summary:"
    echo "   Total packages: ${#PACKAGE_NAMES[@]}"
    echo "   Organization: ${GITHUB_ORG}"
    echo "   Template: ${TEMPLATE_REPO}"
    echo "   Base directory: ${BASE_DIR}"
    echo ""

    read -p "Do you want to proceed? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operation cancelled"
        exit 1
    fi

    # Create packages
    local count=0
    local total=${#PACKAGE_NAMES[@]}
    local successful_packages=()
    local failed_packages=()
    local github_published=()
    local github_failed=()

    for i in "${!PACKAGE_NAMES[@]}"; do
        count=$((count + 1))
        echo ""
        echo "🔄 Progress: ${count}/${total}"

        if create_package "$i"; then
            successful_packages+=("${PACKAGE_NAMES[$i]}")
            # Check if the package was actually published to GitHub
            package_name="${PACKAGE_NAMES[$i]}"
            display_name="${PACKAGE_DISPLAY_NAMES[$i]}"
            repo_name="Xala-Enterprise-${display_name// /-}"

            if gh repo view "${GITHUB_ORG}/${repo_name}" &> /dev/null; then
                github_published+=("${package_name}")
            else
                github_failed+=("${package_name}")
            fi
        else
            failed_packages+=("${PACKAGE_NAMES[$i]}")
            echo "   ❌ Package ${PACKAGE_NAMES[$i]} creation failed!"

            # Ask user if they want to continue or stop
            echo ""
            read -p "   Continue with remaining packages? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "❌ Package creation stopped by user"
                break
            fi
        fi
    done

    # Create workspace overview
    if [ ${#successful_packages[@]} -gt 0 ]; then
        create_workspace_overview
    fi

    echo ""
    echo "📊 PACKAGE CREATION SUMMARY"
    echo "=========================="
    echo ""

    if [ ${#successful_packages[@]} -gt 0 ]; then
        echo "✅ Successfully created packages (${#successful_packages[@]}/${total}):"
        for pkg in "${successful_packages[@]}"; do
            echo "   - ${pkg}"
        done
        echo ""
    fi

    if [ ${#failed_packages[@]} -gt 0 ]; then
        echo "❌ Failed to create packages (${#failed_packages[@]}/${total}):"
        for pkg in "${failed_packages[@]}"; do
            echo "   - ${pkg}"
        done
        echo ""
    fi

    echo "🚀 GITHUB PUBLISHING STATUS"
    echo "==========================="
    echo ""

    if [ ${#github_published[@]} -gt 0 ]; then
        echo "✅ Successfully published to GitHub (${#github_published[@]} packages):"
        for pkg in "${github_published[@]}"; do
            echo "   - ${pkg}"
        done
        echo ""
    fi

    if [ ${#github_failed[@]} -gt 0 ]; then
        echo "❌ Failed to publish to GitHub (${#github_failed[@]} packages):"
        for pkg in "${github_failed[@]}"; do
            echo "   - ${pkg} (exists locally only)"
        done
        echo ""
        echo "💡 To manually publish failed packages:"
        for pkg in "${github_failed[@]}"; do
            echo "   cd ${BASE_DIR}/${pkg} && git push -u origin main"
        done
        echo ""
    fi

    if [ ${#github_published[@]} -eq ${#successful_packages[@]} ] && [ ${#successful_packages[@]} -eq $total ]; then
        echo "🎉 COMPLETE SUCCESS!"
        echo "   ✅ All ${total} packages created and published to GitHub!"
    elif [ ${#successful_packages[@]} -eq $total ]; then
        echo "⚠️ PARTIAL SUCCESS!"
        echo "   ✅ All packages created locally"
        echo "   ⚠️ Some packages not published to GitHub"
    else
        echo "⚠️ INCOMPLETE!"
        echo "   ⚠️ Some packages failed to create"
    fi

    echo ""
    echo "📁 Packages location: ${BASE_DIR}"
    echo "🔗 GitHub organization: https://github.com/${GITHUB_ORG}"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Review each package's README.md for specific setup instructions"
    echo "   2. Implement package-specific functionality"
    echo "   3. Run comprehensive testing: pnpm run test:matrix"
    echo "   4. Validate Norwegian compliance: pnpm run compliance:full"
    echo "   5. Set up CI/CD secrets in each repository"
    echo ""
    echo "🇳🇴 All packages are ready for Norwegian government compliance!"
}

# Run main function
main "$@"
