#!/bin/bash

# SVECTOR SDK - GitHub Packages Authentication Setup
# This script helps set up authentication for GitHub Packages following official documentation

set -e

echo "🔐 SVECTOR SDK - GitHub Packages Authentication Setup"
echo "====================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI not found. Install it from: https://cli.github.com${NC}"
    echo ""
fi

echo -e "${BLUE}📖 GitHub Packages Authentication Guide${NC}"
echo ""
echo "To publish packages to GitHub Packages, you need a GitHub Personal Access Token (classic)"
echo "with the following scopes:"
echo ""
echo -e "${GREEN}Required Scopes:${NC}"
echo "  ✅ write:packages  - Upload packages to GitHub Packages"
echo "  ✅ read:packages   - Download packages from GitHub Packages"
echo "  ✅ delete:packages - Delete packages from GitHub Packages (optional)"
echo "  ✅ repo           - Access to repository metadata"
echo ""

echo -e "${BLUE}🔑 Step 1: Create Personal Access Token${NC}"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token' → 'Generate new token (classic)'"
echo "3. Set expiration (recommended: 90 days)"
echo "4. Select the scopes mentioned above"
echo "5. Click 'Generate token'"
echo "6. Copy the token (you won't see it again!)"
echo ""

read -p "Press Enter when you have your token ready..."
echo ""

echo -e "${BLUE}🔧 Step 2: Configure Authentication${NC}"
echo ""
echo "Choose your authentication method:"
echo ""
echo "1. Project-level authentication (recommended for development)"
echo "2. Global authentication (affects all npm projects)"
echo "3. Manual login via npm CLI"
echo ""

read -p "Enter your choice (1-3): " auth_choice
echo ""

case $auth_choice in
    1)
        echo -e "${GREEN}Setting up project-level authentication...${NC}"
        echo ""
        read -s -p "Enter your GitHub Personal Access Token: " token
        echo ""
        
        # Create or update project .npmrc
        echo "# GitHub Packages Authentication" > .npmrc.local
        echo "@svector-corporation:registry=https://npm.pkg.github.com" >> .npmrc.local
        echo "//npm.pkg.github.com/:_authToken=$token" >> .npmrc.local
        
        echo ""
        echo -e "${GREEN}✅ Created .npmrc.local with your token${NC}"
        echo -e "${YELLOW}⚠️  Remember to add .npmrc.local to .gitignore!${NC}"
        
        # Add to .gitignore if not already there
        if ! grep -q ".npmrc.local" .gitignore 2>/dev/null; then
            echo ".npmrc.local" >> .gitignore
            echo -e "${GREEN}✅ Added .npmrc.local to .gitignore${NC}"
        fi
        ;;
        
    2)
        echo -e "${GREEN}Setting up global authentication...${NC}"
        echo ""
        read -s -p "Enter your GitHub Personal Access Token: " token
        echo ""
        
        # Update global .npmrc
        npm config set @svector-corporation:registry https://npm.pkg.github.com
        npm config set //npm.pkg.github.com/:_authToken $token
        
        echo ""
        echo -e "${GREEN}✅ Updated global npm configuration${NC}"
        ;;
        
    3)
        echo -e "${GREEN}Using npm login method...${NC}"
        echo ""
        echo "Run the following command and use your GitHub credentials:"
        echo ""
        echo -e "${BLUE}npm login --scope=@svector-corporation --auth-type=legacy --registry=https://npm.pkg.github.com${NC}"
        echo ""
        echo "When prompted:"
        echo "  Username: Your GitHub username"
        echo "  Password: Your Personal Access Token (not your GitHub password!)"
        echo "  Email: Your GitHub email address"
        echo ""
        
        read -p "Press Enter to run npm login..."
        npm login --scope=@svector-corporation --auth-type=legacy --registry=https://npm.pkg.github.com
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}🧪 Step 3: Test Authentication${NC}"
echo ""

# Test authentication
if npm whoami --registry=https://npm.pkg.github.com &>/dev/null; then
    username=$(npm whoami --registry=https://npm.pkg.github.com)
    echo -e "${GREEN}✅ Authentication successful! Logged in as: $username${NC}"
else
    echo -e "${YELLOW}⚠️  Authentication test failed. You may need to check your token.${NC}"
fi

echo ""
echo -e "${BLUE}📦 Step 4: Publishing Packages${NC}"
echo ""
echo "To publish your package to GitHub Packages:"
echo ""
echo -e "${GREEN}For scoped packages:${NC}"
echo "  npm publish"
echo ""
echo -e "${GREEN}For publishing to both npm and GitHub Packages:${NC}"
echo "  npm run publish:all"
echo ""

echo -e "${BLUE}🔍 Step 5: Installing Packages${NC}"
echo ""
echo "To install packages from GitHub Packages:"
echo ""
echo -e "${GREEN}Add to your project's .npmrc:${NC}"
echo "  @svector-corporation:registry=https://npm.pkg.github.com"
echo ""
echo -e "${GREEN}Then install:${NC}"
echo "  npm install @svector-corporation/svector-sdk"
echo ""

echo -e "${BLUE}📚 Additional Resources${NC}"
echo ""
echo "• GitHub Packages Documentation: https://docs.github.com/en/packages"
echo "• npm registry documentation: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry"
echo "• Personal Access Tokens: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
echo ""

echo -e "${GREEN}🎉 Setup complete! You're ready to publish to GitHub Packages.${NC}"
