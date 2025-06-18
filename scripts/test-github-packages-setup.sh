#!/bin/bash

# SVECTOR SDK - GitHub Packages Dry Run Test
# This script tests the GitHub Packages setup without actually publishing

set -e

echo "🧪 Testing SVECTOR SDK GitHub Packages Setup (Dry Run)..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check if package-github.json exists
if [ ! -f "package-github.json" ]; then
    echo "❌ Error: package-github.json not found."
    exit 1
fi

# Check if build artifacts exist
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Please run 'npm run build' first."
    exit 1
fi

echo "✅ Project structure looks good!"

# Test package.json configurations
echo "📋 Testing package configurations..."

echo "📦 Original package.json:"
node -p "const pkg = require('./package.json'); \`Name: \${pkg.name}\nVersion: \${pkg.version}\nRepository: \${pkg.repository?.url || 'Not set'}\`"

echo ""
echo "📦 GitHub Packages package.json:"
node -p "const pkg = require('./package-github.json'); \`Name: \${pkg.name}\nVersion: \${pkg.version}\nRepository: \${pkg.repository?.url || 'Not set'}\nPublishConfig: \${JSON.stringify(pkg.publishConfig, null, 2)}\`"

# Test .npmrc creation
echo "🔐 Testing .npmrc creation..."
cat > .npmrc-test << EOF
@svector-corporation:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=TEST_TOKEN
EOF

echo "✅ .npmrc test file created successfully"
cat .npmrc-test
rm .npmrc-test

# Test npm pack (dry run of publishing)
echo "📤 Testing npm pack (simulates publishing)..."

# Create backup of original package.json
cp package.json package.json.backup

# Use the GitHub-specific package.json
cp package-github.json package.json

# Test npm pack
npm pack --dry-run

# Restore original package.json
mv package.json.backup package.json

echo "✅ All tests passed!"
echo ""
echo "🚀 Ready for GitHub Packages publishing!"
echo "📝 Next steps:"
echo "   1. Set your GitHub token: export GITHUB_TOKEN=your_token_here"
echo "   2. Run: ./scripts/publish-to-github-packages.sh"
echo "   3. Or create a GitHub release to trigger automatic publishing"
echo ""
echo "🔗 Setup guide: ./GITHUB_PACKAGES_COMPLETE_SETUP.md"
