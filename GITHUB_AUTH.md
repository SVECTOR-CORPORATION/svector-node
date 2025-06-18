# 🔐 GitHub Packages Authentication Guide

This guide follows the official GitHub Packages documentation for setting up authentication to publish and install packages from GitHub Packages.

## 📖 Overview

GitHub Packages requires authentication using a **Personal Access Token (classic)** with specific scopes. This guide covers all authentication methods recommended by GitHub.

## 🔑 Step 1: Create Personal Access Token

### Required Scopes

Your Personal Access Token (classic) must have these scopes:

- ✅ **`write:packages`** - Upload packages to GitHub Packages
- ✅ **`read:packages`** - Download packages from GitHub Packages  
- ✅ **`delete:packages`** - Delete packages (optional)
- ✅ **`repo`** - Access repository metadata

### Creating the Token

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Set a meaningful note: `SVECTOR SDK - GitHub Packages`
4. Set expiration (recommended: 90 days)
5. Select the required scopes above
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't see it again!)

## 🔧 Step 2: Configure Authentication

### Method 1: Project-Level Authentication (Recommended for Development)

Create a local `.npmrc` file in your project:

```bash
# Run the setup script
npm run setup:github-auth
```

Or manually create `.npmrc.local`:

```ini
@svector-corporation:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_TOKEN_HERE
```

**Important:** Add `.npmrc.local` to `.gitignore` to avoid committing your token!

### Method 2: Global Authentication

Configure npm globally:

```bash
npm config set @svector-corporation:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN_HERE
```

### Method 3: Login via CLI (Alternative)

For npm CLI version 9+:

```bash
npm login --scope=@svector-corporation --auth-type=legacy --registry=https://npm.pkg.github.com
```

When prompted:
- **Username:** Your GitHub username
- **Password:** Your Personal Access Token (NOT your GitHub password!)
- **Email:** Your GitHub email address

## 🧪 Step 3: Test Authentication

Verify your setup:

```bash
# Test authentication
npm whoami --registry=https://npm.pkg.github.com

# Should return your GitHub username
```

## 📦 Step 4: Publishing Packages

### Publish to GitHub Packages Only

```bash
npm run publish:github
```

### Publish to Both npm and GitHub Packages

```bash
npm run publish:dual
```

### Manual Publishing

```bash
# For GitHub Packages (scoped package name required)
npm publish --registry=https://npm.pkg.github.com
```

## 📥 Step 5: Installing Packages

### Configure Consumer Projects

Add to your project's `.npmrc`:

```ini
@svector-corporation:registry=https://npm.pkg.github.com
```

### Install Package

```bash
npm install @svector-corporation/svector-sdk
```

### Installing from Multiple Organizations

If you need packages from multiple GitHub organizations:

```ini
@svector-corporation:registry=https://npm.pkg.github.com
@other-org:registry=https://npm.pkg.github.com
```

## 🤖 CI/CD Authentication

### GitHub Actions (Recommended)

Use `GITHUB_TOKEN` for workflows in the same repository:

```yaml
- name: Publish to GitHub Packages
  run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Other CI/CD Systems

Set environment variable:
```bash
export NPM_CONFIG_//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

## 🔒 Security Best Practices

### Token Security

- ✅ Use minimal required scopes
- ✅ Set appropriate expiration dates
- ✅ Never commit tokens to version control
- ✅ Use environment variables in CI/CD
- ✅ Rotate tokens regularly

### Repository Settings

- ✅ Use `GITHUB_TOKEN` in workflows when possible
- ✅ Set package visibility appropriately
- ✅ Configure package access permissions

## 🐛 Troubleshooting

### Authentication Errors

```bash
# Check current authentication
npm whoami --registry=https://npm.pkg.github.com

# Verify token has correct scopes
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Clear npm cache
npm cache clean --force
```

### Publishing Errors

```bash
# Verify package name is scoped
cat package.json | grep '"name"'

# Should show: "@svector-corporation/svector-sdk"

# Test with dry run
npm publish --dry-run --registry=https://npm.pkg.github.com
```

### Network Issues

```bash
# Check registry configuration
npm config list | grep registry

# Test connectivity
curl -I https://npm.pkg.github.com
```

## 📚 Resources

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [npm Registry Guide](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Package Permissions](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages)

## 📞 Support

If you encounter issues:

1. Check the [GitHub Status](https://www.githubstatus.com/)
2. Review [GitHub Packages Documentation](https://docs.github.com/en/packages)
3. Contact SVECTOR support: support@svector.co.in

---

**Following official GitHub Packages documentation for reliable authentication setup.**
