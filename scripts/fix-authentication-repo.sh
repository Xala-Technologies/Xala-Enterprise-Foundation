#!/bin/bash

# Fix Authentication Repository - Push Correct Template Replacement
# This script fixes the issue where local template replacement worked but GitHub push failed

set -e

echo "🔧 Fixing Authentication Repository Template Variables"
echo "=================================================="

# Configuration
REPO_DIR="xala-packages/authentication"
GITHUB_ORG="Xala-Technologies"
REPO_NAME="Xala-Enterprise-Authentication"

# Check if repository directory exists
if [ ! -d "$REPO_DIR" ]; then
    echo "❌ Repository directory not found: $REPO_DIR"
    echo "💡 Please ensure you've run the create-all-packages.sh script first"
    exit 1
fi

cd "$REPO_DIR"
echo "📁 Working in: $(pwd)"

# Verify current git status
echo ""
echo "🔍 Checking git status..."
git status

# Check if template variables are replaced locally
echo ""
echo "🔍 Verifying local template replacement..."
remaining_vars=$(find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "{{" {} \; 2>/dev/null | wc -l)

if [ "$remaining_vars" -eq 0 ]; then
    echo "✅ Template variables are correctly replaced locally"
else
    echo "❌ Found $remaining_vars files with unreplaced template variables:"
    find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" \) ! -path "./node_modules/*" ! -path "./.git/*" -exec grep -l "{{" {} \; 2>/dev/null | head -5
    echo ""
    echo "🔧 This shouldn't happen - please re-run the template replacement"
    exit 1
fi

# Show sample of replaced content
echo ""
echo "📋 Sample of correctly replaced content:"
echo "========================================"
echo "📄 README.md (first 10 lines):"
head -10 README.md
echo ""
echo "📄 package.json name field:"
grep '"name"' package.json

# Check remote repository status
echo ""
echo "🔍 Checking remote repository..."
if git ls-remote --exit-code origin main >/dev/null 2>&1; then
    echo "✅ Remote repository exists and is accessible"
else
    echo "❌ Cannot access remote repository"
    echo "💡 Please check your GitHub authentication: gh auth status"
    exit 1
fi

# Force push the corrected files
echo ""
echo "🚀 Force pushing corrected template replacement to GitHub..."
echo "⚠️ This will overwrite the existing repository content with the correct template replacement"

read -p "Do you want to proceed with the force push? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

# Create a new commit with the corrected files if needed
if ! git diff --cached --quiet || ! git diff --quiet; then
    echo "📝 Creating commit with corrected template replacement..."
    git add .
    git commit -m "fix: correct template variable replacement

- All {{PACKAGE_NAME}} → authentication
- All {{PACKAGE_DISPLAY_NAME}} → Authentication
- All {{PACKAGE_DESCRIPTION}} → Multi-modal authentication with Norwegian government integration including ID-porten, BankID, and Feide for secure citizen and employee access
- All {{GITHUB_ORG}} → Xala-Technologies
- All {{NSM_CLASSIFICATION}} → KONFIDENSIELT

This fixes the issue where template variables were not properly replaced in the GitHub repository due to macOS timeout command compatibility issue."
else
    echo "ℹ️ No local changes to commit"
fi

# Force push to fix the GitHub repository
echo "🚀 Force pushing to GitHub..."
if git push --force-with-lease origin main; then
    echo "✅ Force push successful!"
    echo ""
    echo "🎉 Authentication repository fixed!"
    echo "🔗 Check the results at: https://github.com/${GITHUB_ORG}/${REPO_NAME}"
    echo ""
    echo "📋 Template variables should now be correctly replaced:"
    echo "   ✅ {{PACKAGE_NAME}} → authentication"
    echo "   ✅ {{PACKAGE_DISPLAY_NAME}} → Authentication"
    echo "   ✅ {{PACKAGE_DESCRIPTION}} → (full description)"
    echo "   ✅ {{GITHUB_ORG}} → Xala-Technologies"
    echo "   ✅ {{NSM_CLASSIFICATION}} → KONFIDENSIELT"
else
    echo "❌ Force push failed!"
    echo "💡 You may need to manually fix the repository"
    echo "🔧 Try: git push --force origin main"
    exit 1
fi

echo ""
echo "✅ Fix completed successfully!"
