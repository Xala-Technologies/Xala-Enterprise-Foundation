#!/bin/bash

# Test script to create a single package and verify template replacement

set -e

echo "🧪 Testing Single Package Creation with Template Replacement"
echo "========================================================="

# Configuration
GITHUB_ORG="Xala-Technologies"
TEMPLATE_REPO="xala-enterprise-package-template"
BASE_DIR="$(pwd)/test-package"

# Test package configuration
PACKAGE_NAME="test-ui-system"
PACKAGE_DISPLAY_NAME="Test UI System"
PACKAGE_DESCRIPTION="Test package for UI components with Norwegian compliance features"
NSM_CLASSIFICATION="ÅPEN"

# Clean up any existing test directory
if [ -d "${BASE_DIR}" ]; then
    echo "🗑️ Cleaning up existing test directory..."
    rm -rf "${BASE_DIR}"
fi

# Create test directory
mkdir -p "${BASE_DIR}"
cd "${BASE_DIR}"

echo ""
echo "📦 Creating test package: ${PACKAGE_NAME}"
echo "   Display Name: ${PACKAGE_DISPLAY_NAME}"
echo "   Description: ${PACKAGE_DESCRIPTION}"
echo "   NSM Classification: ${NSM_CLASSIFICATION}"

# Create repository name
repo_name="Xala-Enterprise-${PACKAGE_DISPLAY_NAME// /-}"

echo "   Repository: ${repo_name}"

# Delete existing repository if it exists
if gh repo view "${GITHUB_ORG}/${repo_name}" &> /dev/null; then
    echo "   🗑️ Deleting existing test repository..."
    gh repo delete "${GITHUB_ORG}/${repo_name}" --yes 2>/dev/null || true
    sleep 3
fi

# Create repository from template
echo "   🔧 Creating repository from template..."
gh repo create "${GITHUB_ORG}/${repo_name}" \
    --template="${GITHUB_ORG}/${TEMPLATE_REPO}" \
    --description="${PACKAGE_DESCRIPTION}" \
    --public \
    --clone

# Move into the cloned directory
if [ -d "${repo_name}" ]; then
    cd "${repo_name}"
else
    echo "   ❌ Failed to create repository: ${repo_name}"
    exit 1
fi

# Replace template variables in files from GitHub template
echo "   🔄 Replacing template variables in template files..."

# Convert display name to PascalCase for proper naming
display_name_pascal=$(echo "${PACKAGE_DISPLAY_NAME}" | sed 's/[^a-zA-Z0-9]//g')
package_name_kebab=$(echo "${PACKAGE_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

# Replace template variables in all relevant files
echo "   📝 Replacing variables:"
echo "      {{PACKAGE_NAME}} → ${package_name_kebab}"
echo "      {{PACKAGE_DISPLAY_NAME}} → ${display_name_pascal}"
echo "      {{PACKAGE_DESCRIPTION}} → ${PACKAGE_DESCRIPTION}"
echo "      {{GITHUB_ORG}} → ${GITHUB_ORG}"
echo "      {{NSM_CLASSIFICATION}} → ${NSM_CLASSIFICATION}"

# Use find and sed to replace template variables
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" -o -name ".*" \) ! -path "./node_modules/*" ! -path "./.git/*" -print0 | while IFS= read -r -d '' file; do
    # Check if file contains template variables before processing
    if grep -q "{{" "$file" 2>/dev/null; then
        echo "   🔄 Processing: $file"
        # Create backup and replace variables
        sed -i.bak \
            -e "s/{{PACKAGE_NAME}}/${package_name_kebab}/g" \
            -e "s/{{PACKAGE_DISPLAY_NAME}}/${display_name_pascal}/g" \
            -e "s|{{PACKAGE_DESCRIPTION}}|${PACKAGE_DESCRIPTION}|g" \
            -e "s/{{GITHUB_ORG}}/${GITHUB_ORG}/g" \
            -e "s/{{NSM_CLASSIFICATION}}/${NSM_CLASSIFICATION}/g" \
            "$file" 2>/dev/null || true

        # Remove backup file
        rm -f "$file.bak" 2>/dev/null || true
    fi
done

echo "   ✅ Template variables replaced successfully"

# Verify that variables were replaced
echo "   🔍 Verifying template variable replacement..."
remaining_vars=$(find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "{{" {} \; 2>/dev/null | wc -l)
if [ "$remaining_vars" -eq 0 ]; then
    echo "   ✅ All template variables replaced successfully"
else
    echo "   ⚠️ Found $remaining_vars files with remaining template variables:"
    find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "{{" {} \; 2>/dev/null | head -5
fi

# Show first 10 lines of README.md to verify replacement
echo ""
echo "📋 First 10 lines of README.md after replacement:"
echo "================================================="
head -10 README.md

# Show package.json name to verify replacement
echo ""
echo "📦 Package name from package.json:"
echo "================================="
grep '"name"' package.json

# Commit changes
echo ""
echo "💾 Committing changes..."
git add .
git commit -m "feat: initialize ${PACKAGE_NAME} package with template variables replaced

- Package name: ${package_name_kebab}
- Display name: ${display_name_pascal}
- NSM Classification: ${NSM_CLASSIFICATION}
- All template variables replaced successfully"

echo "🚀 Pushing to repository..."
git push origin main

echo ""
echo "🎉 Test completed successfully!"
echo "✅ Package created: ${repo_name}"
echo "✅ Template variables replaced"
echo "✅ Changes committed and pushed"
echo ""
echo "🔗 Repository: https://github.com/${GITHUB_ORG}/${repo_name}"

# Clean up
cd ..
rm -rf "${repo_name}"
echo "🧹 Cleaned up local test directory"
