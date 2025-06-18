#!/bin/bash

# SVECTOR SDK - Dual Registry Publishing Script
# Publishes packages to both npm and GitHub Packages following official guidelines

set -e

echo "📦 SVECTOR SDK - Dual Registry Publishing"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")

echo -e "${BLUE}Current package: $PACKAGE_NAME@$CURRENT_VERSION${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Please commit them first.${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborting..."
        exit 1
    fi
fi

# Build the project
echo -e "${BLUE}🔨 Building project...${NC}"
npm run build

echo ""
echo -e "${BLUE}🧪 Running tests...${NC}"
npm test

echo ""
echo -e "${BLUE}📋 Publishing options:${NC}"
echo "1. Publish to npm only"
echo "2. Publish to GitHub Packages only"  
echo "3. Publish to both registries"
echo "4. Dry run (test without publishing)"
echo ""

read -p "Choose publishing option (1-4): " publish_choice
echo ""

case $publish_choice in
    1)
        echo -e "${GREEN}Publishing to npm only...${NC}"
        
        # Reset registry to npm
        npm config set registry https://registry.npmjs.org/
        
        # Publish to npm
        npm publish
        
        echo -e "${GREEN}✅ Published to npm successfully!${NC}"
        ;;
        
    2)
        echo -e "${GREEN}Publishing to GitHub Packages only...${NC}"
        
        # Check if package name is scoped for GitHub Packages
        if [[ ! $PACKAGE_NAME == @* ]]; then
            echo -e "${RED}❌ Package name must be scoped for GitHub Packages (e.g., @svector-corporation/svector-sdk)${NC}"
            exit 1
        fi
        
        # Create temporary package.json with GitHub Packages configuration
        cp package.json package.json.backup
        
        # Update package.json for GitHub Packages
        cat package.json | jq '.name = "@svector-corporation/svector-sdk"' | \
        jq '.publishConfig = {"registry": "https://npm.pkg.github.com"}' > package.json.tmp
        mv package.json.tmp package.json
        
        # Publish to GitHub Packages
        npm publish --registry=https://npm.pkg.github.com
        
        # Restore original package.json
        mv package.json.backup package.json
        
        echo -e "${GREEN}✅ Published to GitHub Packages successfully!${NC}"
        ;;
        
    3)
        echo -e "${GREEN}Publishing to both registries...${NC}"
        echo ""
        
        # First publish to npm
        echo -e "${BLUE}📦 Publishing to npm...${NC}"
        npm config set registry https://registry.npmjs.org/
        npm publish
        echo -e "${GREEN}✅ Published to npm!${NC}"
        
        echo ""
        
        # Then publish to GitHub Packages with scoped name
        echo -e "${BLUE}📦 Publishing to GitHub Packages...${NC}"
        
        # Create temporary package.json with GitHub Packages configuration
        cp package.json package.json.backup
        
        # Update package.json for GitHub Packages
        cat package.json | jq '.name = "@svector-corporation/svector-sdk"' | \
        jq '.publishConfig = {"registry": "https://npm.pkg.github.com"}' > package.json.tmp
        mv package.json.tmp package.json
        
        # Publish to GitHub Packages
        npm publish --registry=https://npm.pkg.github.com
        
        # Restore original package.json
        mv package.json.backup package.json
        
        echo -e "${GREEN}✅ Published to GitHub Packages!${NC}"
        echo ""
        echo -e "${GREEN}🎉 Successfully published to both registries!${NC}"
        ;;
        
    4)
        echo -e "${BLUE}🧪 Running dry run...${NC}"
        echo ""
        
        echo -e "${BLUE}npm publish (dry run):${NC}"
        npm publish --dry-run
        
        echo ""
        echo -e "${BLUE}GitHub Packages publish (dry run):${NC}"
        
        # Create temporary package.json for GitHub Packages
        cp package.json package.json.backup
        cat package.json | jq '.name = "@svector-corporation/svector-sdk"' | \
        jq '.publishConfig = {"registry": "https://npm.pkg.github.com"}' > package.json.tmp
        mv package.json.tmp package.json
        
        npm publish --dry-run --registry=https://npm.pkg.github.com
        
        # Restore original package.json
        mv package.json.backup package.json
        
        echo -e "${GREEN}✅ Dry run completed successfully!${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📊 Package Information:${NC}"
echo "• Package: $PACKAGE_NAME"
echo "• Version: $CURRENT_VERSION"
echo "• npm: https://www.npmjs.com/package/$PACKAGE_NAME"
echo "• GitHub Packages: https://github.com/SVECTOR-CORPORATION/svector-node/packages"
echo ""

echo -e "${BLUE}📚 Installation Instructions:${NC}"
echo ""
echo -e "${GREEN}From npm:${NC}"
echo "  npm install $PACKAGE_NAME"
echo ""
echo -e "${GREEN}From GitHub Packages:${NC}"
echo "  npm install @svector-corporation/svector-sdk --registry=https://npm.pkg.github.com"
echo ""

echo -e "${GREEN}🎉 Publishing process completed!${NC}"
