#!/bin/bash

# SVECTOR SDK - GitHub Packages Publisher
# This script publishes the SVECTOR SDK to GitHub Packages

set -e

echo "SVECTOR SDK - GitHub Packages Publisher"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from the project root."
    exit 1
fi

# Build the project
echo "Building project..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

# Create a backup of package.json
echo "💾 Creating backup of package.json..."
cp package.json package.json.backup

# Update package name for GitHub Packages (scoped)
echo "🔧 Configuring for GitHub Packages..."
sed -i.bak 's/"name": "svector-sdk"/"name": "@svector-corporation\/svector-sdk"/' package.json

# Set GitHub Packages registry
npm config set registry https://npm.pkg.github.com/svector-corporation

echo "📤 Publishing to GitHub Packages..."
npm publish

# Restore original package.json
echo "🔄 Restoring original package.json..."
mv package.json.backup package.json
rm -f package.json.bak

# Reset npm registry
npm config set registry https://registry.npmjs.org/

echo "Successfully published to GitHub Packages!"
echo "Package: @svector-corporation/svector-sdk"
echo "URL: https://github.com/SVECTOR-CORPORATION/svector-node/packages"
