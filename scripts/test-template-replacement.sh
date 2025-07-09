#!/bin/bash

# Template Replacement Test Script
# This script tests the template variable replacement functionality

set -e

echo "🧪 Testing Template Variable Replacement"
echo "======================================="

# Test configuration
TEST_PACKAGE_NAME="test-package"
TEST_DISPLAY_NAME="Test Package"
TEST_DESCRIPTION="A test package for Norwegian government applications with special characters: & < > \" ' | ()"
TEST_GITHUB_ORG="Xala-Technologies"
TEST_NSM_CLASSIFICATION="BEGRENSET"

# Create test directory
TEST_DIR="/tmp/xala-template-test"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

# Copy template files to test directory
cp -r template-package/* "$TEST_DIR/"
cd "$TEST_DIR"

echo "📁 Created test directory: $TEST_DIR"
echo "📋 Test values:"
echo "   Package Name: $TEST_PACKAGE_NAME"
echo "   Display Name: $TEST_DISPLAY_NAME"
echo "   Description: $TEST_DESCRIPTION"
echo "   GitHub Org: $TEST_GITHUB_ORG"
echo "   NSM Classification: $TEST_NSM_CLASSIFICATION"
echo ""

# Test template replacement
echo "🔄 Testing template replacement..."

# Convert display name to PascalCase
display_name_pascal=$(echo "${TEST_DISPLAY_NAME}" | sed 's/[^a-zA-Z0-9]//g')
package_name_kebab=$(echo "${TEST_PACKAGE_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

# Find and replace template variables
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" -o -name ".*" \) ! -path "./node_modules/*" ! -path "./.git/*" -print0 | while IFS= read -r -d '' file; do
    if grep -q "{{" "$file" 2>/dev/null; then
        echo "   🔄 Processing: $file"

        # Create a temporary file for safe replacement
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
content = content.replace('{{GITHUB_ORG}}', '$TEST_GITHUB_ORG')
content = content.replace('{{NSM_CLASSIFICATION}}', '$TEST_NSM_CLASSIFICATION')

# Write to temp file
with open('$temp_file', 'w', encoding='utf-8') as f:
    f.write(content)
" 2>/dev/null || {
            echo "   ⚠️ Python replacement failed for $file, using sed fallback"
            cp "$file" "$temp_file"
            # Escape special characters for sed
            escaped_description=$(printf '%s\n' "$TEST_DESCRIPTION" | sed 's/[[\.*^$()+?{|]/\\&/g')

            sed -i.bak \
                -e "s/{{PACKAGE_NAME}}/${package_name_kebab}/g" \
                -e "s/{{PACKAGE_DISPLAY_NAME}}/${display_name_pascal}/g" \
                -e "s|{{PACKAGE_DESCRIPTION}}|${escaped_description}|g" \
                -e "s/{{GITHUB_ORG}}/${TEST_GITHUB_ORG}/g" \
                -e "s/{{NSM_CLASSIFICATION}}/${TEST_NSM_CLASSIFICATION}/g" \
                "$temp_file" 2>/dev/null || true

            rm -f "${temp_file}.bak" 2>/dev/null || true
        }

        # Move the temp file to replace the original
        mv "$temp_file" "$file" 2>/dev/null || {
            echo "   ❌ Failed to replace $file"
            rm -f "$temp_file" 2>/dev/null || true
            return 1
        }
    fi
done

echo "✅ Template replacement completed"

# Verify replacement
echo ""
echo "🔍 Verifying replacement results..."

# Check if any template variables remain
remaining_vars=$(find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "{{" {} \; 2>/dev/null | wc -l)

if [ "$remaining_vars" -eq 0 ]; then
    echo "✅ All template variables replaced successfully"
else
    echo "❌ Found $remaining_vars files with remaining template variables:"
    find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "{{" {} \; 2>/dev/null | head -5
    echo ""
    echo "Sample remaining variables:"
    find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -n "{{" {} \; 2>/dev/null | head -10
fi

echo ""
echo "📋 Sample of replaced content (README.md):"
echo "==========================================="
head -20 README.md

echo ""
echo "📋 Sample of replaced content (package.json):"
echo "=============================================="
head -10 package.json

echo ""
echo "🧪 Template replacement test completed!"
echo "   Test directory: $TEST_DIR"
echo "   You can inspect the results manually if needed"

# Clean up test directory
read -p "Clean up test directory? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$TEST_DIR"
    echo "🗑️ Test directory cleaned up"
else
    echo "📁 Test directory preserved: $TEST_DIR"
fi
