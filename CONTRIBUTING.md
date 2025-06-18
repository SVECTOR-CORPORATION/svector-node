# Contributing to SVECTOR SDK

We welcome contributions to the SVECTOR SDK! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SVECTOR-CORPORATION/svector-node.git
   cd svector-sdk
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Run examples**:
   ```bash
   # Set your API key
   export SVECTOR_API_KEY="your-api-key-here"
   
   # Run examples
   npm run examples
   ```

## Project Structure

```
svector-sdk/
├── src/
│   ├── index.ts          # Main exports
│   ├── client.ts         # Main SVECTOR client
│   ├── types.ts          # TypeScript type definitions
│   ├── errors.ts         # Custom error classes
│   ├── utils.ts          # Utility functions
│   └── api/              # API endpoint implementations
│       ├── chat.ts       # Chat completions
│       ├── files.ts      # File uploads
│       ├── knowledge.ts  # Knowledge collections
│       └── models.ts     # Model listing
├── examples/             # Usage examples
├── dist/                 # Compiled output
├── README.md            # Project documentation
├── package.json         # Package configuration
└── tsconfig.json        # TypeScript configuration
```

## Code Style

- Use TypeScript for all source code
- Follow existing code style and conventions
- Use descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and single-purpose

## Adding New Features

1. **API Endpoints**: Add new endpoint implementations in `src/api/`
2. **Types**: Update `src/types.ts` with new interface definitions
3. **Errors**: Add new error types in `src/errors.ts` if needed
4. **Examples**: Create usage examples in `examples/`
5. **Documentation**: Update README.md with new features

## Testing

While we're working on a comprehensive test suite, please manually test your changes:

1. Build the project: `npm run build`
2. Test with real API calls using your SVECTOR API key
3. Verify TypeScript types compile correctly: `npm run type-check`

## Pull Request Process

1. **Fork the repository** and create your feature branch from `main`
2. **Make your changes** following the code style guidelines
3. **Test your changes** thoroughly
4. **Update documentation** if you're adding new features
5. **Submit a pull request** with a clear title and description

### Pull Request Guidelines

- Keep changes focused and atomic
- Write clear commit messages
- Include relevant examples if adding new features
- Update README.md if needed
- Ensure TypeScript types are correct

## Reporting Issues

When reporting issues, please include:

- SVECTOR SDK version
- Node.js version (if applicable)
- Browser version (if applicable)
- Minimal code example that reproduces the issue
- Error messages and stack traces

## Feature Requests

We welcome feature requests! Please:

- Check if the feature already exists
- Describe the use case clearly
- Provide examples of how it would be used
- Consider backwards compatibility

## API Compatibility

We follow semantic versioning and strive to maintain backwards compatibility:

- **Major versions**: Breaking changes
- **Minor versions**: New features, backwards compatible
- **Patch versions**: Bug fixes, backwards compatible

## Code of Conduct

Please be respectful and professional in all interactions. We're building an inclusive community around SVECTOR's AI tools.

## Questions?

If you have questions about contributing:

- Open an issue for general questions
- Email us at: support@svector.co.in
- Check our documentation: https://platform.svector.co.in

Thank you for contributing to SVECTOR SDK! 🚀
