# GitHub Packages & NPM Setup Guide

## 🔐 Setting up Secrets

You need to add your NPM token as a secret in your GitHub repository.

### Step 1: Add NPM Token to GitHub Secrets

1. Go to your GitHub repository: https://github.com/SVECTOR-CORPORATION/svector-node
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `NPM_TOKEN`
6. Value: `NPM TOKEN` (your NPM token)
7. Click **Add secret**

### Step 2: Verify Token Permissions

Make sure your NPM token has the following permissions:
- **Automation** - For CI/CD publishing
- **Publish** - To publish packages
- **Read and write** - For package management

### Step 3: Test the Setup

Once the secret is added, you can test the workflow by:

1. **Manual trigger**: Go to Actions tab → Publish Package → Run workflow
2. **Release trigger**: Create a new release on GitHub

## Manual Publishing (Alternative)

If you prefer to publish manually, you can use these commands:

### Publish to NPM
```bash
# Ensure you're logged in
npm whoami

# Build and publish
npm run build
npm publish
```

### Publish to GitHub Packages
```bash
# Login to GitHub Packages
npm login --scope=@svector-corporation --registry=https://npm.pkg.github.com

# Update package name for GitHub Packages
npm run build
cp package.json package.json.backup
sed -i.bak 's/"name": "svector-sdk"/"name": "@svector-corporation\/svector-sdk"/' package.json

# Publish to GitHub Packages
npm publish --registry=https://npm.pkg.github.com

# Restore original package.json
mv package.json.backup package.json
```

## Installation from GitHub Packages

Users can install your package from GitHub Packages:

```bash
# Configure npm to use GitHub Packages for @svector-corporation scope
npm config set @svector-corporation:registry https://npm.pkg.github.com

# Create .npmrc file with authentication
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc

# Install the package
npm install @svector-corporation/svector-sdk
```

## 🔍 Troubleshooting

### Token Issues
- Verify the token is correctly added to GitHub secrets
- Ensure the token has the right permissions
- Check if the token has expired

### Publishing Issues
- Make sure the package version is incremented
- Verify the build completes successfully
- Check the package.json format is valid

### GitHub Packages Access
- Ensure users have access to the repository
- Private packages require authentication
- Public packages can be accessed by anyone

## Useful Links

- [NPM Tokens](https://docs.npmjs.com/about-access-tokens)
- [GitHub Packages for npm](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
