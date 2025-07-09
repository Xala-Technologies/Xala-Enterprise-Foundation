#!/bin/bash

# Single Package Creation Test Script
# This script tests creating a single package to verify the template replacement works

set -e

echo "🧪 Testing Single Package Creation"
echo "================================="

# Configuration
GITHUB_ORG="Xala-Technologies"
BASE_DIR="$(pwd)/test-package-output"

# Test package configuration
TEST_PACKAGE_NAME="test-package"
TEST_DISPLAY_NAME="Test Package"
TEST_DESCRIPTION="A test package for Norwegian government applications with special characters: & < > \" ' | () - testing template replacement functionality"
TEST_NSM_CLASSIFICATION="BEGRENSET"

echo "📋 Test Configuration:"
echo "   Package Name: ${TEST_PACKAGE_NAME}"
echo "   Display Name: ${TEST_DISPLAY_NAME}"
echo "   Description: ${TEST_DESCRIPTION}"
echo "   NSM Classification: ${TEST_NSM_CLASSIFICATION}"
echo "   Output Directory: ${BASE_DIR}"
echo ""

# Clean up existing test directory
if [ -d "${BASE_DIR}" ]; then
    echo "🗑️ Cleaning up existing test directory..."
    rm -rf "${BASE_DIR}"
fi

# Create base directory
mkdir -p "${BASE_DIR}"
cd "${BASE_DIR}"

# Package creation logic (simplified from main script)
repo_name="Xala-Enterprise-${TEST_DISPLAY_NAME// /-}"
repo_dir="${BASE_DIR}/${TEST_PACKAGE_NAME}"

echo "📦 Creating test package: ${TEST_PACKAGE_NAME}"
echo "   Repository Name: ${repo_name}"
echo "   Local Directory: ${repo_dir}"

# Create package directory and copy template files
echo "   📁 Creating package directory and copying template files..."
mkdir -p "${repo_dir}"

# Copy template files from local template-package directory
if [ -d "../template-package" ]; then
    cp -r ../template-package/* "${repo_dir}/"
    cd "${repo_dir}"
    echo "   ✅ Template files copied from local template-package"
else
    echo "   ❌ Template package directory not found: ../template-package"
    echo "   💡 Please ensure template-package exists in the parent directory"
    exit 1
fi

# Initialize git repository (without creating GitHub repo for test)
echo "   🔧 Initializing git repository..."
git init
git remote add origin "https://github.com/${GITHUB_ORG}/${repo_name}.git"

# Replace template variables
echo "   🔄 Replacing template variables..."

# Convert display name to PascalCase
display_name_pascal=$(echo "${TEST_DISPLAY_NAME}" | sed 's/[^a-zA-Z0-9]//g')
package_name_kebab=$(echo "${TEST_PACKAGE_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

echo "   📝 Replacing variables:"
echo "      {{PACKAGE_NAME}} → ${package_name_kebab}"
echo "      {{PACKAGE_DISPLAY_NAME}} → ${display_name_pascal}"
echo "      {{PACKAGE_DESCRIPTION}} → ${TEST_DESCRIPTION}"
echo "      {{GITHUB_ORG}} → ${GITHUB_ORG}"
echo "      {{NSM_CLASSIFICATION}} → ${TEST_NSM_CLASSIFICATION}"

# Process template files
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" -o -name ".*" \) ! -path "./node_modules/*" ! -path "./.git/*" -print0 | while IFS= read -r -d '' file; do
    if grep -q "{{" "$file" 2>/dev/null; then
        echo "   🔄 Processing: $file"

        temp_file=$(mktemp)

        # Use Python for robust string replacement
        python3 -c "
import sys

# Read the file
with open('$file', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace template variables
content = content.replace('{{PACKAGE_NAME}}', '$package_name_kebab')
content = content.replace('{{PACKAGE_DISPLAY_NAME}}', '$display_name_pascal')
content = content.replace('{{PACKAGE_DESCRIPTION}}', '''$TEST_DESCRIPTION''')
content = content.replace('{{GITHUB_ORG}}', '$GITHUB_ORG')
content = content.replace('{{NSM_CLASSIFICATION}}', '$TEST_NSM_CLASSIFICATION')

# Write to temp file
with open('$temp_file', 'w', encoding='utf-8') as f:
    f.write(content)
" 2>/dev/null || {
            echo "   ⚠️ Python replacement failed for $file, using sed fallback"
            cp "$file" "$temp_file"
            escaped_description=$(printf '%s\n' "$TEST_DESCRIPTION" | sed 's/[[\.*^$()+?{|]/\\&/g')

            sed -i.bak \
                -e "s/{{PACKAGE_NAME}}/${package_name_kebab}/g" \
                -e "s/{{PACKAGE_DISPLAY_NAME}}/${display_name_pascal}/g" \
                -e "s|{{PACKAGE_DESCRIPTION}}|${escaped_description}|g" \
                -e "s/{{GITHUB_ORG}}/${GITHUB_ORG}/g" \
                -e "s/{{NSM_CLASSIFICATION}}/${TEST_NSM_CLASSIFICATION}/g" \
                "$temp_file" 2>/dev/null || true

            rm -f "${temp_file}.bak" 2>/dev/null || true
        }

        mv "$temp_file" "$file" 2>/dev/null || {
            echo "   ❌ Failed to replace $file"
            rm -f "$temp_file" 2>/dev/null || true
        }
    fi
done

echo "   ✅ Template variables replaced"

# Verify replacement
echo "   🔍 Verifying template variable replacement..."
remaining_vars=$(find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "{{" {} \; 2>/dev/null | wc -l)

if [ "$remaining_vars" -eq 0 ]; then
    echo "   ✅ All template variables replaced successfully"
else
    echo "   ❌ Found $remaining_vars files with remaining template variables:"
    find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "{{" {} \; 2>/dev/null | head -5
    echo ""
    echo "Sample remaining variables:"
    find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -n "{{" {} \; 2>/dev/null | head -10
fi

# Show sample results
echo ""
echo "📋 Sample Results:"
echo "=================="
echo ""
echo "📄 README.md (first 30 lines):"
echo "------------------------------"
head -30 README.md
echo ""
echo "📄 package.json (first 20 lines):"
echo "----------------------------------"
head -20 package.json

echo ""
echo "🎉 Test package creation completed!"
echo "   📁 Package location: ${repo_dir}"
echo "   📋 You can inspect the complete results in the output directory"
echo ""

# Ask user if they want to clean up
read -p "Clean up test directory? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd ../..
    rm -rf "${BASE_DIR}"
    echo "🗑️ Test directory cleaned up"
else
    echo "📁 Test directory preserved: ${BASE_DIR}"
fi
