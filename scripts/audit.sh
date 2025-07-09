#!/bin/bash

# Foundation Package Audit Script
# Run this in your foundation package directory

echo "🔍 Foundation Package Audit Starting..."
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the foundation package directory?"
    exit 1
fi

echo "✅ Found package.json"

# 1. Package Configuration Audit
echo ""
echo "📦 Package Configuration Audit"
echo "--------------------------------"

# Check package.json validity
if jq empty package.json 2>/dev/null; then
    echo "✅ package.json is valid JSON"
else
    echo "❌ package.json is invalid JSON"
fi

# Check for required fields
PACKAGE_NAME=$(jq -r '.name // "missing"' package.json)
PACKAGE_VERSION=$(jq -r '.version // "missing"' package.json)
echo "📋 Package: $PACKAGE_NAME@$PACKAGE_VERSION"

# Check TypeScript config
if [ -f "tsconfig.json" ]; then
    echo "✅ TypeScript config found"
else
    echo "❌ tsconfig.json missing"
fi

# 2. Module Structure Audit
echo ""
echo "🏗️  Module Structure Audit"
echo "---------------------------"

EXPECTED_MODULES=(
    "config-loader"
    "feature-toggle" 
    "logger"
    "error-handler"
    "i18n-core"
    "metrics-sdk"
    "healthcheck"
    "event-core"
    "event-publisher"
    "event-subscriber"
    "saga-orchestrator"
)

FOUND_MODULES=0
MISSING_MODULES=()

for module in "${EXPECTED_MODULES[@]}"; do
    if [ -d "src/$module" ]; then
        if [ -f "src/$module/index.ts" ]; then
            echo "✅ $module (with index.ts)"
            ((FOUND_MODULES++))
        else
            echo "⚠️  $module (missing index.ts)"
        fi
    else
        echo "❌ $module (missing)"
        MISSING_MODULES+=("$module")
    fi
done

echo "📊 Found $FOUND_MODULES/${#EXPECTED_MODULES[@]} expected modules"

# 3. Testing Infrastructure Audit
echo ""
echo "🧪 Testing Infrastructure Audit"
echo "--------------------------------"

# Check for test framework
if jq -e '.devDependencies | has("jest")' package.json > /dev/null; then
    echo "✅ Jest testing framework installed"
else
    echo "❌ Jest not found in devDependencies"
fi

# Check for jest config
if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ] || jq -e '.jest' package.json > /dev/null; then
    echo "✅ Jest configuration found"
else
    echo "❌ Jest configuration missing"
fi

# Check for TypeScript Jest
if jq -e '.devDependencies | has("ts-jest")' package.json > /dev/null; then
    echo "✅ TypeScript Jest support installed"
else
    echo "❌ ts-jest not found in devDependencies"
fi

# Count test files
TEST_FILES=$(find . -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "📋 Found $TEST_FILES test files"

# 4. Code Quality Audit
echo ""
echo "🔍 Code Quality Audit"
echo "---------------------"

# Check for ESLint
if jq -e '.devDependencies | has("eslint")' package.json > /dev/null; then
    echo "✅ ESLint installed"
else
    echo "❌ ESLint not found"
fi

# Check for Prettier
if jq -e '.devDependencies | has("prettier")' package.json > /dev/null; then
    echo "✅ Prettier installed"
else
    echo "❌ Prettier not found"
fi

# Check for TypeScript
if jq -e '.devDependencies | has("typescript")' package.json > /dev/null; then
    echo "✅ TypeScript installed"
else
    echo "❌ TypeScript not found"
fi

# 5. Documentation Audit
echo ""
echo "📚 Documentation Audit"
echo "----------------------"

# Check root README
if [ -f "README.md" ]; then
    README_SIZE=$(wc -c < README.md)
    if [ $README_SIZE -gt 500 ]; then
        echo "✅ README.md exists and has content ($README_SIZE bytes)"
    else
        echo "⚠️  README.md exists but is small ($README_SIZE bytes)"
    fi
else
    echo "❌ README.md missing"
fi

# Check module READMEs
MODULE_READMES=0
for module in "${EXPECTED_MODULES[@]}"; do
    if [ -f "src/$module/README.md" ]; then
        ((MODULE_READMES++))
    fi
done
echo "📋 Found $MODULE_READMES/${#EXPECTED_MODULES[@]} module READMEs"

# 6. Build Audit
echo ""
echo "🏗️  Build Audit"
echo "---------------"

# Check if TypeScript compiles
if command -v pnpm >/dev/null 2>&1; then
    if pnpm run type-check 2>/dev/null; then
        echo "✅ TypeScript compilation successful"
    else
        echo "❌ TypeScript compilation failed"
    fi
else
    echo "⚠️  pnpm not available, skipping TypeScript compilation check"
fi

# Check for build script
if jq -e '.scripts | has("build")' package.json > /dev/null; then
    echo "✅ Build script found"
else
    echo "❌ Build script missing"
fi

# 7. Summary and Recommendations
echo ""
echo "📋 Audit Summary"
echo "================"

if [ ${#MISSING_MODULES[@]} -eq 0 ]; then
    echo "✅ All expected modules present"
else
    echo "❌ Missing modules: ${MISSING_MODULES[*]}"
fi

# Generate recommendations
echo ""
echo "🎯 Recommendations"
echo "==================="

if [ $TEST_FILES -eq 0 ]; then
    echo "🔴 HIGH PRIORITY: Add test files for all modules"
fi

if [ ! -f "jest.config.js" ]; then
    echo "🔴 HIGH PRIORITY: Add Jest configuration"
fi

if [ $MODULE_READMES -lt ${#EXPECTED_MODULES[@]} ]; then
    echo "🟡 MEDIUM PRIORITY: Add README.md to all modules"
fi

if ! jq -e '.devDependencies | has("eslint")' package.json > /dev/null; then
    echo "🟡 MEDIUM PRIORITY: Add ESLint for code quality"
fi

if [ ! -f "README.md" ]; then
    echo "🟡 MEDIUM PRIORITY: Add comprehensive root README.md"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Follow the testing strategy guide to add comprehensive tests"
echo "2. Implement missing modules using the provided examples"
echo "3. Add proper documentation to all modules"
echo "4. Set up CI/CD pipeline for automated testing and publishing"

echo ""
echo "Audit completed! Use the verification guide for detailed implementation steps." 