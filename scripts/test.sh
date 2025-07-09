#!/bin/bash
# Foundation Package Test Script

set -e

echo "🧪 Testing @xala-technologies/foundation..."

# Run type checking first
echo "🔍 Type checking..."
npx tsc --noEmit

# Run tests with coverage
echo "📊 Running tests with coverage..."
npx jest --coverage --passWithNoTests

# Run compliance tests
echo "��️ Running compliance tests..."
npx jest --testPathPattern="compliance" --passWithNoTests

echo "✅ All tests passed!"
