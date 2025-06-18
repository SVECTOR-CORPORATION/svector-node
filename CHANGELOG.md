# Changelog

All notable changes to the SVECTOR SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.6] - 2025-06-18

### 🚀 Added
- **Complete GitHub Packages Integration** following official documentation
- **Dual-registry publishing** support (npm + GitHub Packages)
- **Interactive authentication setup** with `npm run setup:github-auth`
- **Automated CI/CD workflows** with GITHUB_TOKEN
- **Comprehensive authentication guide** (`GITHUB_AUTH.md`)
- **Multiple publishing scripts**:
  - `npm run publish:dual` - Both registries
  - `npm run publish:npm` - npm only  
  - `npm run publish:github` - GitHub Packages only
  - `npm run publish:dry-run` - Test without publishing

### 🔧 Enhanced
- **Scoped package naming** for GitHub Packages (`@svector-corporation/svector-sdk`)
- **Enhanced `.npmrc`** configuration for dual registries
- **Security best practices** with token management
- **Project-level vs global** authentication options
- **GitHub Actions workflow** improvements

### 🐛 Fixed
- **SHA256 hash** in Homebrew formula
- **Workflow authentication** issues with proper token usage
- **Package naming** for scoped packages
- **Registry configuration** conflicts

### 📦 Distribution
- **npm**: `npm install svector-sdk`
- **Pip**: `pip intall svector-sdk`
- **GitHub Packages**: `npm install @svector-corporation/svector-sdk`
- **JSR (Deno)**: `import { SVECTOR } from "jsr:@svector/svector@1.1.6"`
- **Homebrew**: `brew install svector`

## [1.0.0] - 2024-12-17

### Added
- Initial release of SVECTOR SDK
- Chat completions API with full type definitions
- Streaming support for real-time responses
- File upload functionality for document processing
- Knowledge collection management
- Comprehensive TypeScript support with full type definitions
- Automatic retry logic with exponential backoff
-  Robust error handling with specific error types
-  Multi-platform support (Node.js, browsers, Deno, Bun)
-  Utility functions for file handling
-  Comprehensive documentation and examples
-  Validation tools and example scripts

### Features
- **Chat Completions**: Full support for SVECTOR's Spec-Chat models
- **Streaming**: Server-sent events for real-time responses
- **File Management**: Upload files in multiple formats for RAG
- **Knowledge Collections**: Organize and manage document collections
- **Error Handling**: Specific error types for different API scenarios
- **Type Safety**: Complete TypeScript definitions
- **Multi-environment**: Works in Node.js, browsers, Deno, and Bun
- **Generic HTTP**: Support for custom/undocumented endpoints

### API Endpoints Supported
- `POST /api/chat/completions` - Chat completions with streaming support
- `GET /api/models` - List available models
- `POST /api/v1/files/` - File uploads for RAG
- `POST /api/v1/knowledge/{id}/file/add` - Add files to knowledge collections

### Error Types
- `AuthenticationError` - Invalid API key or authentication issues
- `PermissionDeniedError` - Insufficient permissions
- `NotFoundError` - Resource not found
- `RateLimitError` - Rate limit exceeded
- `UnprocessableEntityError` - Invalid request data
- `InternalServerError` - Server-side errors
- `APIConnectionError` - Network connection issues
- `APIConnectionTimeoutError` - Request timeout

### Examples Included
- Basic chat completion
- Streaming chat responses
- File upload and RAG usage
- Advanced RAG with multiple files
- Browser usage examples
- Node.js integration patterns
- Error handling demonstrations
- Comprehensive feature showcase

### Documentation
- Complete README with usage examples
- Detailed API reference documentation
- Contributing guidelines
- Browser and Node.js specific examples
- TypeScript usage patterns

### Development
- TypeScript source code with strict type checking
- Comprehensive build system
- Example validation scripts
- npm package optimization
- Multi-environment testing support

## [Unreleased]

### Planned Features
-  Comprehensive test suite with Jest
- Usage analytics and monitoring hooks
- Auto-pagination for list endpoints
-  Advanced RAG features (collection management)
- 📝 Enhanced logging capabilities
-  Proxy configuration support
-  Internationalization support
- 📱 React Native compatibility
- 🎨 OpenAPI specification generation
- Enhanced security features

### Future Enhancements
- Support for additional SVECTOR models
- Advanced streaming options
- Webhook support for async operations
- Plugin system for extensions
- Performance optimizations
- Enhanced browser compatibility
- CDN distribution options
- Documentation improvements
- More comprehensive examples
- Integration guides for popular frameworks

---

For support and questions, contact the SVECTOR team at support@svector.co.in or visit https://www.svector.co.in
