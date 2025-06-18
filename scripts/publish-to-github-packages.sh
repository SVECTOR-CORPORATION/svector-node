#!/bin/bash

# SVECTOR SDK - GitHub Packages Publisher
# This script publishes the SVECTOR SDK to GitHub Packages

set -e

echo "🚀 Publishing SVECTOR SDK to GitHub Packages..."

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable is not set"
    echo "Please set your GitHub Personal Access Token:"
    echo "export GITHUB_TOKEN=your_github_token_here"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Create backup of original package.json
echo "📋 Creating backup of package.json..."
cp package.json package.json.backup

# Use the GitHub-specific package.json
echo "📦 Updating package.json for GitHub Packages..."
cp package-github.json package.json

# Create .npmrc for authentication
echo "🔐 Setting up authentication..."
cat > .npmrc << EOF
@svector-corporation:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
EOF

# Publish to GitHub Packages
echo "📤 Publishing to GitHub Packages..."
npm publish --registry=https://npm.pkg.github.com

# Restore original package.json
echo "🔄 Restoring original package.json..."
mv package.json.backup package.json

# Clean up .npmrc
rm -f .npmrc

echo "✅ Successfully published to GitHub Packages!"
echo "📦 Package: @svector-corporation/svector-sdk@$(node -p "require('./package-github.json').version")"
echo "🔗 View at: https://github.com/SVECTOR-CORPORATION/svector-node/packages"
