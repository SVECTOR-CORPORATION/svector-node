#!/bin/bash

# SVECTOR SDK Manual Publish Script
# This script helps you publish to both npm and GitHub Packages

set -e

echo "SVECTOR SDK Publisher"
echo "========================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check if we're logged into npm
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Error: Not logged into npm. Run 'npm login' first."
    exit 1
fi

echo "Found package.json"
echo "Logged into npm as: $(npm whoami)"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Build the package
echo "🔨 Building package..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "Build successful"

# Ask user what to publish
echo ""
echo "Where would you like to publish?"
echo "1) NPM only"
echo "2) GitHub Packages only" 
echo "3) Both NPM and GitHub Packages"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "📤 Publishing to NPM..."
        npm publish
        echo "Published to NPM successfully!"
        echo "View at: https://www.npmjs.com/package/svector-sdk"
        ;;
    2)
        echo "📤 Publishing to GitHub Packages..."
        
        # Backup original package.json
        cp package.json package.json.backup
        
        # Update package name for GitHub Packages
        sed -i.bak 's/"name": "svector-sdk"/"name": "@svector-corporation\/svector-sdk"/' package.json
        
        # Publish to GitHub Packages
        npm publish --registry=https://npm.pkg.github.com
        
        # Restore original package.json
        mv package.json.backup package.json
        rm -f package.json.bak
        
        echo "Published to GitHub Packages successfully!"
        echo "View at: https://github.com/SVECTOR-CORPORATION/svector-node/packages"
        ;;
    3)
        echo "📤 Publishing to NPM..."
        npm publish
        echo "Published to NPM successfully!"
        
        echo "📤 Publishing to GitHub Packages..."
        
        # Backup original package.json
        cp package.json package.json.backup
        
        # Update package name for GitHub Packages
        sed -i.bak 's/"name": "svector-sdk"/"name": "@svector-corporation\/svector-sdk"/' package.json
        
        # Publish to GitHub Packages
        npm publish --registry=https://npm.pkg.github.com
        
        # Restore original package.json
        mv package.json.backup package.json
        rm -f package.json.bak
        
        echo "Published to GitHub Packages successfully!"
        echo ""
        echo "🎉 Published to both registries!"
        echo "NPM: https://www.npmjs.com/package/svector-sdk"
        echo "GitHub: https://github.com/SVECTOR-CORPORATION/svector-node/packages"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Publishing complete!"
echo "📖 Installation instructions:"
echo ""
echo "From NPM:"
echo "  npm install svector-sdk"
echo ""
echo "From GitHub Packages:"
echo "  npm install @svector-corporation/svector-sdk --registry=https://npm.pkg.github.com"
