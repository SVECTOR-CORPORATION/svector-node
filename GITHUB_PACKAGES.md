# SVECTOR SDK - GitHub Packages Setup

This guide explains how to set up and use GitHub Packages for the SVECTOR SDK.

## Quick Setup

### 1. Authentication

Create a GitHub Personal Access Token with `packages:write` permission:

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. Select scopes: `write:packages`, `read:packages`, `repo`
4. Copy the token

### 2. Configure npm for GitHub Packages

```bash
# Login to GitHub Packages
npm login --scope=@svector-corporation --registry=https://npm.pkg.github.com

# Or configure manually
echo "@svector-corporation:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

## 📤 Publishing

### Method 1: Automated Script

```bash
# Run the automated publish script
./scripts/publish-github.sh
```

### Method 2: Manual Publishing

```bash
# 1. Build the project
npm run build

# 2. Test the build
npm test

# 3. Create scoped package for GitHub
cp package.json package.json.backup
sed -i 's/"name": "svector-sdk"/"name": "@svector-corporation\/svector-sdk"/' package.json

# 4. Publish to GitHub Packages
npm publish --registry=https://npm.pkg.github.com

# 5. Restore original package.json
mv package.json.backup package.json
```

### Method 3: GitHub Actions (Automated)

The repository includes a GitHub Actions workflow that automatically publishes to both npm and GitHub Packages when you create a release.

## 📥 Installation from GitHub Packages

### For End Users

```bash
# Configure npm to use GitHub Packages for @svector-corporation scope
npm config set @svector-corporation:registry https://npm.pkg.github.com

# Install the package
npm install @svector-corporation/svector-sdk
```

### Using .npmrc in Project

Create `.npmrc` in your project:

```
@svector-corporation:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Then install:

```bash
npm install @svector-corporation/svector-sdk
```

## 🔧 Configuration Files

### package.json
```json
{
  "name": "svector-sdk",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/SVECTOR-CORPORATION/svector-node.git"
  }
}
```

### .npmrc (for publishing)
```
@svector-corporation:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

## 🌍 Dual Publishing (npm + GitHub Packages)

The SVECTOR SDK is published to both registries:

- **npm Registry**: `svector-sdk` (public)
- **GitHub Packages**: `@svector-corporation/svector-sdk` (scoped)

### Installation Options

```bash
# From npm (recommended for most users)
npm install svector-sdk

# From GitHub Packages (for enterprise/private use)
npm install @svector-corporation/svector-sdk
```

## Private Package Access

For private repositories or packages:

1. Users need GitHub access to the repository
2. Must authenticate with GitHub token
3. Configure npm to use GitHub Packages registry

## 📊 Package Management

### View Packages

Visit: https://github.com/SVECTOR-CORPORATION/svector-node/packages

### Package Versions

Both registries maintain synchronized versions:

- npm: https://www.npmjs.com/package/svector-sdk
- GitHub: https://github.com/SVECTOR-CORPORATION/svector-node/packages

## CI/CD Integration

### GitHub Actions Secrets

Set these secrets in your repository:

- `NPM_TOKEN`: npm authentication token
- `GITHUB_TOKEN`: Automatically provided by GitHub

### Workflow Triggers

- **Automatic**: On release creation
- **Manual**: Workflow dispatch from Actions tab

## 🛠️ Troubleshooting

### Authentication Issues

```bash
# Clear npm cache
npm cache clean --force

# Re-login to GitHub Packages
npm logout --registry=https://npm.pkg.github.com
npm login --scope=@svector-corporation --registry=https://npm.pkg.github.com
```

### Publishing Errors

```bash
# Check current registry
npm config get registry

# Verify authentication
npm whoami --registry=https://npm.pkg.github.com

# Check package.json configuration
cat package.json | grep -A5 "publishConfig"
```

### Installation Issues

```bash
# Verify scope configuration
npm config get @svector-corporation:registry

# Check authentication for private packages
npm ping --registry=https://npm.pkg.github.com
```

## 📚 Additional Resources

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [npm Scoped Packages](https://docs.npmjs.com/cli/v7/using-npm/scope)
- [GitHub Actions for npm](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)

---

**🏢 SVECTOR Corporation**  
For support: support@svector.co.in
