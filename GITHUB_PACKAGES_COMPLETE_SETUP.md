# 📦 GitHub Packages Setup for SVECTOR SDK

This guide follows the official [GitHub Packages documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) to set up dual publishing to both npm and GitHub Packages.

## 🔐 Step 1: Create Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: `SVECTOR Package Publishing`
4. Select these scopes:
   - ✅ `write:packages` - Upload packages to GitHub Packages
   - ✅ `read:packages` - Download packages from GitHub Packages
   - ✅ `delete:packages` - Delete packages from GitHub Packages (optional)
   - ✅ `repo` - Full control of private repositories (if needed)

## 🔧 Step 2: Add Secrets to Repository

1. Go to your repository: `SVECTOR-CORPORATION/svector-node`
2. Go to Settings → Secrets and variables → Actions
3. Add these secrets:
   - **`NPM_TOKEN`**: Your npm authentication token (for publishing to npm)
   - **`GITHUB_TOKEN`**: Your GitHub personal access token (for GitHub Packages)

Note: `GITHUB_TOKEN` is automatically provided by GitHub Actions, but you can also set a custom one.

## 📦 Step 3: Package Configuration

We've created two configurations:

### For npm (regular): `package.json`
```json
{
  "name": "svector-sdk",
  "version": "1.1.3",
  // ... rest of config
}
```

### For GitHub Packages: `package-github.json`
```json
{
  "name": "@svector-corporation/svector-sdk",
  "version": "1.1.3",
  "publishConfig": {
    "@svector-corporation:registry": "https://npm.pkg.github.com"
  }
  // ... rest of config
}
```

## 🚀 Step 4: Publishing Options

### Option A: Automatic Publishing (GitHub Actions)

The workflow `.github/workflows/publish.yml` will automatically publish to both registries when:
- A new release is created
- Manual workflow dispatch is triggered

### Option B: Manual Publishing

#### Publish to npm:
```bash
npm run build
npm publish
```

#### Publish to GitHub Packages:
```bash
# Set your GitHub token
export GITHUB_TOKEN=your_github_token_here

# Run the GitHub Packages script
./scripts/publish-to-github-packages.sh
```

## 📥 Step 5: Installing Packages

### From npm (public):
```bash
npm install svector-sdk
```

### From GitHub Packages (scoped):
```bash
# Create .npmrc in your project
echo "@svector-corporation:registry=https://npm.pkg.github.com" >> .npmrc

# Install the scoped package
npm install @svector-corporation/svector-sdk
```

## 🔍 Step 6: Verification

After publishing, you can verify the packages:

1. **npm**: https://www.npmjs.com/package/svector-sdk
2. **GitHub Packages**: https://github.com/SVECTOR-CORPORATION/svector-node/packages

## 🛠️ Usage Examples

### Using npm package:
```javascript
import { SVECTOR } from 'svector-sdk';
// or
const { SVECTOR } = require('svector-sdk');
```

### Using GitHub Packages:
```javascript
import { SVECTOR } from '@svector-corporation/svector-sdk';
// or  
const { SVECTOR } = require('@svector-corporation/svector-sdk');
```

Both packages have identical functionality!

## 🚨 Troubleshooting

### Authentication Issues
```bash
# Check if token is set
echo $GITHUB_TOKEN

# Login to npm (if needed)
npm login --registry=https://npm.pkg.github.com
```

### Package Not Found
1. Ensure the repository has packages enabled
2. Check package visibility (public vs private)
3. Verify authentication token has correct permissions

### Build Issues
```bash
# Clean and rebuild
npm run clean
npm run build
npm test
```

## 📝 Notes

- GitHub Packages requires **scoped package names** (starting with `@`)
- The first time you publish, the package visibility defaults to private
- You can change package visibility in the GitHub repository packages section
- Both registries will have the same version numbers but different names

## 🔗 Useful Links

- [GitHub Packages npm registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [npm documentation](https://docs.npmjs.com/)
- [GitHub Actions for package publishing](https://docs.github.com/en/actions/publishing-packages)

---

**Need help?** Contact SVECTOR Team at support@svector.co.in
