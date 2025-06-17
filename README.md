# SVECTOR SDK

[![npm version](https://badge.fury.io/js/svector.svg)](https://badge.fury.io/js/svector)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

The official TypeScript and JavaScript SDK for SVECTOR AI Models. Build powerful AI applications with advanced conversational AI and language models.R SDK

[![npm version](https://badge.fury.io/js/svector.svg)](https://badge.fury.io/js/svector)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

The official TypeScript and JavaScript SDK for SVECTOR AI Models. Build applications with advanced conversational AI and language models.

```bash
npm install svector-sdk
```

## Features

- Chat Completions - Full support for SVECTOR's advanced AI models
- Streaming Support - Real-time streaming responses with Server-Sent Events  
- File Management - Easy file uploads for document processing
- Knowledge Collections - Organize and manage document collections
- Type Safety - Complete TypeScript support with comprehensive type definitions
- Automatic Retries - Built-in retry logic with exponential backoff
- Multi-platform - Works in Node.js, browsers, Deno, Bun, and Cloudflare Workers
- Error Handling - Comprehensive error types and handling

## Quick Start

### Installation

```bash
npm install svector-sdk
```

### Basic Usage

```typescript
import { SVECTOR } from 'svector-sdk';

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY, // Get your API key from https://www.svector.co.in
});

// Simple chat completion
const response = await client.chat.create({
  model: 'spec-3-turbo:latest',
  messages: [
    { role: 'user', content: 'What is artificial intelligence?' }
  ],
  max_tokens: 150,
  temperature: 0.7,
});

console.log(response.choices[0].message.content);
```

### Streaming Chat

```typescript
const stream = await client.chat.createStream({
  model: 'spec-3-turbo:latest',
  messages: [
    { role: 'user', content: 'Tell me a short story about AI' }
  ],
  stream: true,
});

for await (const event of stream) {
  if (event.choices?.[0]?.delta?.content) {
    process.stdout.write(event.choices[0].delta.content);
  }
}
```

## Table of Contents

- [Installation](#installation)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Chat Completions](#chat-completions)
  - [Models](#models)
  - [File Management](#file-management)
  - [Knowledge Collections](#knowledge-collections)
- [Error Handling](#error-handling)
- [Advanced Usage](#advanced-usage)
- [Environment Support](#environment-support)
- [Examples](#examples)
- [Contributing](#contributing)

## Authentication

Get your API key from the SVECTOR Dashboard and set it as an environment variable:

```bash
export SVECTOR_API_KEY="your-api-key-here"
```

Or pass it directly to the client:

```typescript
const client = new SVECTOR({
  apiKey: 'your-api-key-here',
});
```

## API Reference

### Chat Completions

#### Basic Chat

```typescript
const completion = await client.chat.create({
  model: 'spec-3-turbo:latest',
  messages: [
    { role: 'user', content: 'Hello, how are you?' }
  ],
  max_tokens: 100,
  temperature: 0.7,
});
```

#### Multi-turn Conversation

```typescript
const completion = await client.chat.create({
  model: 'spec-3-turbo:latest',
  messages: [
    { role: 'developer', content: 'You are a helpful programming assistant.' },
    { role: 'user', content: 'How do I reverse a string in Python?' }
  ],
});
```

#### Streaming Responses

```typescript
const stream = await client.chat.createStream({
  model: 'spec-3-turbo:latest',
  messages: [{ role: 'user', content: 'Write a poem about technology' }],
  stream: true,
});

for await (const event of stream) {
  if (event.choices?.[0]?.delta?.content) {
    process.stdout.write(event.choices[0].delta.content);
  }
}
```

### Models

```typescript
// List all available models
const models = await client.models.list();
console.log(models.models);
// Output: ['spec-3-turbo:latest', 'spec-3-pro:latest', ...]
```

### File Management

Upload files for use with document processing:

```typescript
// From file (Node.js)
import fs from 'fs';
const fileResponse = await client.files.create(
  fs.createReadStream('document.pdf'),
  'rag',
  'document.pdf'
);

// From Buffer (Node.js)
const buffer = fs.readFileSync('document.pdf');
const fileResponse = await client.files.create(buffer, 'files', 'document.pdf');

// From File object (Browser)
const file = document.getElementById('fileInput').files[0];
const fileResponse = await client.files.create(file, 'files');

// From string content
const text = 'This is my document content...';
const fileResponse = await client.files.create(text, 'files', 'document.txt');

console.log(`File uploaded: ${fileResponse.file_id}`);
```

### Knowledge Collections

Organize files into collections for better performance:

```typescript
// Add a file to a knowledge collection
const result = await client.knowledge.addFile(
  'your-collection-id',
  'your-file-id'
);
console.log(result.status); // 'success'
```

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
import { 
  SVECTOR, 
  AuthenticationError, 
  RateLimitError, 
  APIError 
} from 'svector';

try {
  const response = await client.chat.create({
    model: 'spec-3-turbo:latest',
    messages: [{ role: 'user', content: 'Hello' }],
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key:', error.message);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded:', error.message);
    // Implement backoff strategy
  } else if (error instanceof APIError) {
    console.error(`API error: ${error.message} (${error.status})`);
    console.error(`Request ID: ${error.request_id}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Available Error Types

- `AuthenticationError` - Invalid API key or authentication issues
- `PermissionDeniedError` - Insufficient permissions
- `NotFoundError` - Resource not found
- `RateLimitError` - Rate limit exceeded
- `UnprocessableEntityError` - Invalid request data
- `InternalServerError` - Server-side errors
- `APIConnectionError` - Network connection issues
- `APIConnectionTimeoutError` - Request timeout

## Advanced Usage

### Client Configuration

```typescript
const client = new SVECTOR({
  apiKey: 'your-api-key',
  baseURL: 'https://spec-chat.tech',     // Custom API endpoint
  maxRetries: 3,                            // Retry failed requests
  timeout: 30000,                           // Request timeout (ms)
  dangerouslyAllowBrowser: false,           // Allow browser usage
});
```

### Request-specific Options

```typescript
const response = await client.chat.create(
  {
    model: 'spec-3-turbo:latest',
    messages: [{ role: 'user', content: 'Hello' }],
  },
  {
    timeout: 60000,           // Override timeout for this request
    maxRetries: 1,            // Override retry count
    headers: {                // Additional headers
      'X-Custom-Header': 'value'
    }
  }
);
```

### Generic HTTP Methods

For custom endpoints or undocumented features:

```typescript
// Direct API access
const customData = await client.get('/api/custom-endpoint');
const result = await client.post('/api/custom-endpoint', { key: 'value' });
```

### Custom Fetch Implementation

```typescript
import fetch from 'node-fetch';

const client = new SVECTOR({
  apiKey: 'your-key',
  fetch: fetch as any,
});
```

### Response Inspection

```typescript
// Get both response data and raw HTTP response
const { data, response } = await client.chat.createWithResponse({
  model: 'spec-3-turbo:latest',
  messages: [{ role: 'user', content: 'Hello' }],
});

console.log('Status:', response.status);
console.log('Headers:', response.headers);
console.log('Message:', data.choices[0].message.content);
```

## Environment Support

The SVECTOR SDK works across multiple JavaScript environments:

### Node.js (18+)
```typescript
import { SVECTOR } from 'svector';
const client = new SVECTOR(); // Uses SVECTOR_API_KEY env var
```

### Browser (with bundlers like Webpack, Vite)
```typescript
import { SVECTOR } from 'svector';
const client = new SVECTOR({
  apiKey: 'your-key',
  dangerouslyAllowBrowser: true, // Required for browser usage
});
```

### Deno
```typescript
import { SVECTOR } from 'npm:svector';
const client = new SVECTOR({
  apiKey: Deno.env.get('SVECTOR_API_KEY'),
});
```

### Bun
```typescript
import { SVECTOR } from 'svector';
const client = new SVECTOR(); // Works like Node.js
```

### Cloudflare Workers
```typescript
import { SVECTOR } from 'svector';

export default {
  async fetch(request, env) {
    const client = new SVECTOR({
      apiKey: env.SVECTOR_API_KEY,
    });
    // ... your worker logic
  }
};
```

## Examples

### Chat with Conversation History

```typescript
import { SVECTOR } from 'svector';

class Chat {
  private client: SVECTOR;
  private conversationHistory: Array<{role: string, content: string}> = [];

  constructor(apiKey: string) {
    this.client = new SVECTOR({ apiKey });
  }

  async chat(userMessage: string) {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const response = await this.client.chat.create({
      model: 'spec-3-turbo:latest',
      messages: this.conversationHistory,
      temperature: 0.7,
    });

    const botMessage = response.choices[0].message.content;
    this.conversationHistory.push({ role: 'assistant', content: botMessage });

    return botMessage;
  }
}

// Usage
const bot = new Chat(process.env.SVECTOR_API_KEY);
console.log(await bot.chat('Hello!'));
console.log(await bot.chat('Tell me about yourself'));
```

### Document Q&A System

```typescript
import { SVECTOR } from 'svector';
import fs from 'fs';

class DocumentQA {
  private client: SVECTOR;
  private fileIds: string[] = [];

  constructor() {
    this.client = new SVECTOR();
  }

  async addDocument(filePath: string) {
    const fileResponse = await this.client.files.create(
      fs.createReadStream(filePath),
      'rag'
    );
    this.fileIds.push(fileResponse.file_id);
    return fileResponse.file_id;
  }

  async ask(question: string) {
    const response = await this.client.chat.create({
      model: 'spec-3-turbo:latest',
      messages: [{ role: 'user', content: question }],
      files: this.fileIds.map(id => ({ type: 'file', id })),
    });

    return response.choices[0].message.content;
  }
}

// Usage
const qa = new DocumentQA();
await qa.addDocument('./research-paper.pdf');
await qa.addDocument('./company-docs.docx');

const answer = await qa.ask('What are the key findings in the research?');
console.log(answer);
```

### Streaming Chat Interface

```typescript
import { SVECTOR } from 'svector';

async function streamingChat(userMessage: string) {
  const client = new SVECTOR();
  
  console.log('User:', userMessage);
  console.log('Assistant: ');

  const stream = await client.chat.createStream({
    model: 'spec-3-turbo:latest',
    messages: [
      { role: 'developer', content: 'You are a helpful assistant.' },
      { role: 'user', content: userMessage }
    ],
    stream: true,
  });

  let fullResponse = '';
  for await (const event of stream) {
    if (event.choices?.[0]?.delta?.content) {
      const chunk = event.choices[0].delta.content;
      process.stdout.write(chunk);
      fullResponse += chunk;
    }
  }
  console.log('\n');
  
  return fullResponse;
}

// Usage
await streamingChat('Explain quantum computing in simple terms');
```

## Testing Your Integration

Validate your SVECTOR SDK setup:

```bash
# Clone the repository and run validation
git clone https://github.com/svector-corporation/svector-sdk.git
cd svector-sdk
npm install
npm run validate

# Or use the built-in validation in your project
npm install svector
npx svector-validate
```

## More Resources

- � **[Complete API Documentation](./API.md)** - Detailed API reference
- **SVECTOR Website** - Official website
- **Examples Repository** - More usage examples  
- **API Documentation** - Interactive API testing
- **Support** - Technical support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style and conventions
- Submitting pull requests
- Reporting issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## What's Next?

- Check out our [examples](./examples/) for more advanced use cases
- Read the [API documentation](./API.md) for complete reference
- Join our community for support and updates
- Start building amazing AI-powered applications!

---

Thank you for using SVECTOR SDK!

For support: [support@svector.co.in](mailto:support@svector.co.in) | [Website](https://www.svector.co.in) | [Dashboard](https://www.svector.co.in/dashboard)
