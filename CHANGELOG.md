# Changelog

All notable changes to the SVECTOR SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-17

### Added
- 🎉 Initial release of SVECTOR SDK
- 💬 Chat completions API with full OpenAI-compatible interface
- 🌊 Streaming support for real-time responses
- 📁 File upload functionality for RAG (Retrieval Augmented Generation)
- 🧠 Knowledge collection management
- 🔒 Comprehensive TypeScript support with full type definitions
- ⚡ Automatic retry logic with exponential backoff
- 🛡️ Robust error handling with specific error types
- 🌐 Multi-platform support (Node.js, browsers, Deno, Bun)
- 🔧 Utility functions for file handling
- 📚 Comprehensive documentation and examples
- 🧪 Validation tools and example scripts

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
- 🧪 Comprehensive test suite with Jest
- 📊 Usage analytics and monitoring hooks
- 🔄 Auto-pagination for list endpoints
- 🎯 Advanced RAG features (collection management)
- 📝 Enhanced logging capabilities
- 🔧 Proxy configuration support
- 🌍 Internationalization support
- 📱 React Native compatibility
- 🎨 OpenAPI specification generation
- 🔐 Enhanced security features

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
