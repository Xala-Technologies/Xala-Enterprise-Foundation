#!/bin/bash
set -e

echo "🔧 Simulating GitHub Actions CI Workflow Locally"
echo "=================================================="

# Simulate GitHub Actions environment
export GITHUB_ACTIONS=true
export CI=true
export NODE_ENV=test

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔍 Running linting..."
pnpm run lint

echo "🔨 Running TypeScript checks..."
pnpm run typecheck

echo "🧪 Running tests with CI configuration..."
pnpm run test:ci

echo "🏗️ Running build..."
pnpm run build

echo "✅ CI Workflow simulation completed successfully!"
