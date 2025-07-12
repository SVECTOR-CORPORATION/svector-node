# SVECTOR SDK

[![npm version](https://badge.fury.io/js/svector-sdk.svg)](https://badge.fury.io/js/svector-sdk)  
[![JSR](https://jsr.io/badges/@svector/svector)](https://jsr.io/@svector/svector)  
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)


**Official JavaScript and TypeScript SDK for accessing SVECTOR APIs.**

SVECTOR develops high-performance AI models and automation solutions, specializing in artificial intelligence, mathematical computing, and computational research. This SDK provides programmatic access to SVECTOR's API services through type-safe JavaScript/TypeScript interfaces, completion endpoints, document processing capabilities, and additional AI model integrations.

**Multi-Platform Support**: This repository contains both the npm package (`svector-sdk`) and the JSR package (`@svector/svector`) for seamless integration across Node.js, Deno, Bun, and browser environments.


## Repository Structure

This repository contains both package distributions:

```
svector-node/
├── src/                    # npm package source (Node.js/TypeScript)
│   ├── api/               # API implementations  
│   ├── client.ts          # Main client
│   ├── types.ts           # TypeScript definitions
│   └── index.ts           # npm package entry
├── jsr/                   # JSR package source (Deno/JSR)
│   ├── api/               # Deno-compatible API implementations
│   ├── client.ts          # Deno-compatible client
│   ├── mod.ts             # JSR package entry  
│   └── deno.json          # Deno configuration
├── examples/              # Usage examples
└── package.json           # npm package config
```

**Package Locations:**

- **Website**: [https://www.svector.co.in](https://www.svector.co.in)
- **Documentation**: [API Reference](API.md)
- **Issues**: [GitHub Issues](https://github.com/SVECTOR-CORPORATION/svector-node/issues)
- **Support**: [support@svector.co.in](mailto:support@svector.co.in)
- **npm Package**: [svector-sdk](https://www.npmjs.com/package/svector-sdk)
- **JSR Package**: [@svector/svector](https://jsr.io/@svector/svector)
- **Deno Land**: [deno.land/@svector/svector](https://jsr.io/@svector/svector)- Full-featured package for Node.js/Bun
- **JSR**: `@svector/svector` - Deno-optimized package from `/jsr` folder)

## Quick Start

### For Node.js/npm
```bash
npm install svector-sdk
```

```typescript
import { SVECTOR } from 'svector-sdk';

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});

const result = await client.conversations.create({
  model: 'spec-3-turbo',
  instructions: 'You are a helpful AI assistant that explains complex topics clearly.',
  input: 'What is artificial intelligence?',
});

console.log(result.output);
```

### For Deno/JSR
```bash
deno add jsr:@svector/svector
```

```typescript
import { SVECTOR } from "jsr:@svector/svector";

const client = new SVECTOR({
  apiKey: Deno.env.get("SVECTOR_API_KEY"),
});

const result = await client.conversations.create({
  model: 'spec-3-turbo',
  instructions: 'You are a helpful AI assistant that explains complex topics clearly.',
  input: 'What is artificial intelligence?',
});

console.log(result.output);
```

##  Table of Contents

- [Installation](#installation)
- [Authentication](#authentication)
- [Repository Structure](#repository-structure)
- [Core Features](#core-features)
- [Conversations API (Recommended)](#conversations-api-recommended)
- [Chat Completions API (Advanced)](#chat-completions-api-advanced)
- [Streaming Responses](#streaming-responses)
- [File Management & Document Processing](#file-management--document-processing)
- [Models](#models)
- [Error Handling](#error-handling)
- [Advanced Configuration](#advanced-configuration)
- [Environment Support](#environment-support)
- [Complete Examples](#complete-examples)
- [Best Practices](#best-practices)
- [Contributing](#contributing)

##  Installation

### npm / yarn (Node.js)
```bash
npm install svector-sdk
# or
yarn add svector-sdk
```

### Deno / JSR
```bash
# Using JSR (recommended for Deno)
deno add jsr:@svector/svector

# Or using npm package in Deno
deno add npm:svector-sdk
```

### Direct Import (Deno)
```typescript
import { SVECTOR } from 'jsr:@svector/svector';
```

### Browser (via CDN)
```typescript
import { SVECTOR } from 'https://esm.sh/svector-sdk';
```

## Authentication

Get your API key from the [SVECTOR Platform](https://platform.svector.co.in) and set it as an environment variable:

```bash
export SVECTOR_API_KEY="your-api-key-here"
```

Or pass it directly to the client:

```typescript
const client = new SVECTOR({
  apiKey: 'your-api-key-here',
});
```

##  Core Features

- **Conversations API** - Simple instructions + input interface
- **Advanced Chat Completions** - Full control with role-based messages
- **Real-time Streaming** - Server-sent events for live responses
- **File Processing** - Upload and process documents (PDF, DOCX, TXT, etc.)
- **Knowledge Collections** - Organize files for enhanced RAG
- **TypeScript Native** - Full type safety and IntelliSense
- **Multi-environment** - Node.js, Browser, Deno, Bun, Cloudflare Workers
- **Robust Error Handling** - Comprehensive error types and retry logic

##  Conversations API (Recommended)

The **Conversations API** provides a sophisticated, user-friendly interface. Just provide instructions and input - the SDK handles all the complex role management internally!

### Basic Conversation

```typescript
import { SVECTOR } from 'svector-sdk';

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});

const result = await client.conversations.create({
  model: 'spec-3-turbo',
  instructions: 'You are a helpful assistant that explains things clearly.',
  input: 'What is machine learning?',
  temperature: 0.7,
  max_tokens: 200,
});

console.log(result.output);
// "Machine learning is a subset of artificial intelligence..."
```

### Conversation with Context

```typescript
const result = await client.conversations.create({
  model: 'spec-3-turbo',
  instructions: 'You are a programming tutor that helps students learn coding.',
  input: 'Can you show me an example?',
  context: [
    'How do I create a function in Python?',
    'You can create a function using the def keyword followed by the function name and parameters...'
  ],
  temperature: 0.5,
});
```

### Streaming Conversation

```typescript
const stream = await client.conversations.createStream({
  model: 'spec-3-turbo',
  instructions: 'You are a creative storyteller.',
  input: 'Tell me a short story about robots and humans.',
  stream: true,
});

console.log('Story: ');
for await (const event of stream) {
  if (!event.done) {
    process.stdout.write(event.content);
  }
}
```

### Document-based Conversation

```typescript
import fs from 'node:fs';
import { SVECTOR } from 'svector-sdk';

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});

async function analyzeDocument(filePath, question = "Analyze this document and provide key findings.") {
  const fileResponse = await client.files.create(
    fs.readFileSync(filePath),
    'default',
    filePath.split('/').pop()
  );
  
  const result = await client.conversations.create({
    model: 'spec-3-turbo',
    instructions: 'You are a document analyst. Provide clear, concise analysis.',
    input: `${question}\n\nDocument content:\n${fileResponse.data.content}`,
    temperature: 0.3,
  });

  console.log(result.output);
  return result.output;
}

await analyzeDocument('document.pdf');
```

##  Chat Completions API (Advanced)

For full control over the conversation structure, use the Chat Completions API with role-based messages:

### Basic Chat

```typescript
const completion = await client.chat.create({
  model: 'spec-3-turbo',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, how are you?' }
  ],
  max_tokens: 150,
  temperature: 0.7,
});

console.log(completion.choices[0].message.content);
```

### Multi-turn Conversation

```typescript
const conversation = [
  { role: 'system', content: 'You are a helpful programming assistant.' },
  { role: 'user', content: 'How do I reverse a string in Python?' },
  { role: 'assistant', content: 'You can reverse a string using slicing: string[::-1]' },
  { role: 'user', content: 'Can you show me other methods?' }
];

const response = await client.chat.create({
  model: 'spec-3-turbo',
  messages: conversation,
  temperature: 0.5,
});
```

### Developer Role (System-level Instructions)

```typescript
const response = await client.chat.create({
  model: 'spec-3-turbo',
  messages: [
    { role: 'developer', content: 'You are an expert code reviewer. Provide detailed feedback.' },
    { role: 'user', content: 'Please review this Python code: def add(a, b): return a + b' }
  ],
});
```

##  Streaming Responses

Both Conversations and Chat APIs support real-time streaming:

### Conversations Streaming

```typescript
const stream = await client.conversations.createStream({
  model: 'spec-3-turbo',
  instructions: 'You are a creative writer.',
  input: 'Write a poem about technology.',
  stream: true,
});

for await (const event of stream) {
  if (!event.done) {
    process.stdout.write(event.content);
  } else {
    console.log('\n✓ Stream completed');
  }
}
```

### Chat Streaming

```typescript
const stream = await client.chat.createStream({
  model: 'spec-3-turbo',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum computing' }
  ],
  stream: true,
});

for await (const event of stream) {
  if (event.choices?.[0]?.delta?.content) {
    process.stdout.write(event.choices[0].delta.content);
  }
}
```

##  File Management & Document Processing

Upload and process various file formats for enhanced AI capabilities:

### Upload from File System (Node.js)

```typescript
import fs from 'node:fs';

const fileResponse = await client.files.create(
  fs.readFileSync('document.pdf'),
  'default',
  'document.pdf'
);

console.log(`File uploaded: ${fileResponse.id}`);
```

### Upload from Buffer

```typescript
const buffer = fs.readFileSync('document.pdf');
const fileResponse = await client.files.create(buffer, 'default', 'document.pdf');
```

### Upload from String Content

```typescript
const content = `
# Research Notes
This document contains important findings...
`;

const fileResponse = await client.files.create(content, 'default', 'notes.md');
```

### Upload in Browser

```typescript
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const file = fileInput.files[0];

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
  dangerouslyAllowBrowser: true,
});

const fileResponse = await client.files.create(file, 'default');
```

### Using toFile Utility

```typescript
import { toFile } from 'svector-sdk';

// Convert buffer to file
const buffer = Buffer.from('Hello world');
const file = await toFile(buffer, 'hello.txt');
const response = await client.files.create(file, 'default');

// Convert string to file
const stringFile = await toFile('Content here', 'content.txt', { type: 'text/plain' });
```

### Document Q&A

```typescript
const doc1 = await client.files.create(fs.readFileSync('manual.pdf'), 'default', 'manual.pdf');
const doc2 = await client.files.create(fs.readFileSync('faq.docx'), 'default', 'faq.docx');

const answer = await client.conversations.create({
  model: 'spec-3-turbo',
  instructions: 'You are a helpful assistant that answers questions based on provided documents.',
  input: `What are the key features mentioned in the manual?\n\nDocument 1: ${doc1.data.content}\nDocument 2: ${doc2.data.content}`,
});
```

##  Knowledge Collections

Organize multiple files into collections for better performance and context management:

```typescript
// Add files to a knowledge collection
const result1 = await client.knowledge.addFile('collection-123', 'file-456');
const result2 = await client.knowledge.addFile('collection-123', 'file-789');

// Use the entire collection in conversations
const response = await client.conversations.create({
  model: 'spec-3-turbo',
  instructions: 'You are a research assistant with access to our knowledge base.',
  input: 'Summarize all the information about our products.',
  files: [{ type: 'collection', id: 'collection-123' }],
});
```

## Models

SVECTOR provides several cutting-edge foundational AI models:

### Available Models

```typescript
// List all available models
const models = await client.models.list();
console.log(models.models);
```

**SVECTOR's Foundational Models:**

- **`spec-3-turbo`** - Fast, efficient model for most use cases
- **`spec-3`** - Standard model with balanced performance  
- **`theta-35-mini`** - Lightweight model for simple tasks
- **`theta-35`** - Advanced model for complex reasoning

### Model Selection Guide

```typescript
// For quick responses and general tasks
const quickResponse = await client.conversations.create({
  model: 'spec-3-turbo',
  instructions: 'You are a helpful assistant.',
  input: 'What time is it?',
});

// For complex reasoning and analysis
const complexAnalysis = await client.conversations.create({
  model: 'theta-35',
  instructions: 'You are an expert data analyst.',
  input: 'Analyze the trends in this quarterly report.',
  files: [{ type: 'file', id: 'report-file-id' }],
});

// For lightweight tasks
const simpleTask = await client.conversations.create({
  model: 'theta-35-mini',
  instructions: 'You help with simple questions.',
  input: 'What is 2 + 2?',
});
```

##  Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
import { 
  SVECTOR, 
  AuthenticationError, 
  RateLimitError, 
  NotFoundError,
  APIError 
} from 'svector-sdk';

const client = new SVECTOR();

try {
  const response = await client.conversations.create({
    model: 'spec-3-turbo',
    instructions: 'You are a helpful assistant.',
    input: 'Hello world',
  });
  
  console.log(response.output);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key:', error.message);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded:', error.message);
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found:', error.message);
  } else if (error instanceof APIError) {
    console.error(`API error: ${error.message} (Status: ${error.status})`);
    console.error(`Request ID: ${error.request_id}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Available Error Types

- **`AuthenticationError`** - Invalid API key or authentication issues
- **`PermissionDeniedError`** - Insufficient permissions for the resource
- **`NotFoundError`** - Requested resource not found
- **`RateLimitError`** - API rate limit exceeded
- **`UnprocessableEntityError`** - Invalid request data or parameters
- **`InternalServerError`** - Server-side errors
- **`APIConnectionError`** - Network connection issues
- **`APIConnectionTimeoutError`** - Request timeout

##  Advanced Configuration

### Client Configuration

```typescript
const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
  baseURL: 'https://api.svector.co.in',
  maxRetries: 3,
  timeout: 30000,
  dangerouslyAllowBrowser: false,
  fetch: customFetch,
});
```

### Request-specific Options

```typescript
const response = await client.conversations.create(
  {
    model: 'spec-3-turbo',
    instructions: 'You are a helpful assistant.',
    input: 'Hello',
  },
  {
    timeout: 60000,
    maxRetries: 1,
    headers: {
      'X-Custom-Header': 'value',
      'X-Request-Source': 'my-app'
    }
  }
);
```

### Response Inspection

```typescript
// Get both response data and raw HTTP response
const { data, response } = await client.conversations.createWithResponse({
  model: 'spec-3-turbo',
  instructions: 'You are a helpful assistant.',
  input: 'Hello',
});

console.log('Status:', response.status);
console.log('Headers:', Object.fromEntries(response.headers.entries()));
console.log('Response:', data.output);
console.log('Request ID:', data._request_id);
```

##  Environment Support

The SVECTOR SDK works across multiple JavaScript environments:

### Node.js (18+)
```typescript
import { SVECTOR } from 'svector-sdk';
const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});
```

### Browser (with bundlers)
```typescript
import { SVECTOR } from 'svector-sdk';
const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
  dangerouslyAllowBrowser: true,
});
```

### Deno
```typescript
import { SVECTOR } from 'jsr:@svector/svector';
// or
import { SVECTOR } from 'npm:svector-sdk';

const client = new SVECTOR({
  apiKey: Deno.env.get('SVECTOR_API_KEY'),
});
```

### Bun
```typescript
import { SVECTOR } from 'svector-sdk';
const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});
```

### Cloudflare Workers
```typescript
import { SVECTOR } from 'svector-sdk';

export default {
  async fetch(request, env) {
    const client = new SVECTOR({
      apiKey: env.SVECTOR_API_KEY,
    });
    
    const result = await client.conversations.create({
      model: 'spec-3-turbo',
      instructions: 'You are a helpful assistant.',
      input: 'Hello from Cloudflare Workers!',
    });
    
    return new Response(result.output);
  }
};
```

## 💡 Complete Examples

### Intelligent Chat Application

```typescript
import { SVECTOR } from 'svector-sdk';

class IntelligentChat {
  private client: SVECTOR;
  private conversationHistory: string[] = [];

  constructor(apiKey: string) {
    this.client = new SVECTOR({ apiKey });
  }

  async chat(userMessage: string, systemInstructions?: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push(userMessage);

    const result = await this.client.conversations.create({
      model: 'spec-3-turbo',
      instructions: systemInstructions || 'You are a helpful and friendly AI assistant.',
      input: userMessage,
      context: this.conversationHistory.slice(-10), // Keep last 10 messages
      temperature: 0.7,
    });

    // Add AI response to history
    this.conversationHistory.push(result.output);

    return result.output;
  }

  async streamChat(userMessage: string): Promise<void> {
    console.log('Assistant: ');
    
    const stream = await this.client.conversations.createStream({
      model: 'spec-3-turbo',
      instructions: 'You are a helpful AI assistant. Be conversational and engaging.',
      input: userMessage,
      context: this.conversationHistory.slice(-6),
      stream: true,
    });

    let fullResponse = '';
    for await (const event of stream) {
      if (!event.done) {
        process.stdout.write(event.content);
        fullResponse += event.content;
      }
    }
    console.log('\n');

    this.conversationHistory.push(userMessage, fullResponse);
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

// Usage
const chat = new IntelligentChat(process.env.SVECTOR_API_KEY);

// Regular chat
console.log(await chat.chat('Hello! How are you today?'));

// Streaming chat
await chat.streamChat('Tell me an interesting fact about space.');

// Specialized chat
console.log(await chat.chat(
  'Explain quantum computing', 
  'You are a physics professor who explains complex topics in simple terms.'
));
```

### Document Analysis System

```typescript
import { SVECTOR } from 'svector-sdk';
import fs from 'fs';

class DocumentAnalyzer {
  private client: SVECTOR;
  private uploadedFiles: string[] = [];

  constructor() {
    this.client = new SVECTOR();
  }

  async addDocument(filePath: string): Promise<string> {
    try {
      const fileResponse = await this.client.files.create(
        fs.createReadStream(filePath),
        'default',
        filePath.split('/').pop()
      );
      
      this.uploadedFiles.push(fileResponse.file_id);
      console.log(`Uploaded: ${filePath} (ID: ${fileResponse.file_id})`);
      return fileResponse.file_id;
    } catch (error) {
      console.error(`Failed to upload ${filePath}:`, error);
      throw error;
    }
  }

  async analyze(query: string, analysisType: 'summary' | 'questions' | 'insights' = 'insights'): Promise<string> {
    const instructions = {
      summary: 'You are an expert document summarizer. Provide clear, concise summaries.',
      questions: 'You are an expert analyst. Answer questions based on the provided documents with citations.',
      insights: 'You are a research analyst. Extract key insights, patterns, and important findings.'
    };

    const result = await this.client.conversations.create({
      model: 'spec-3-turbo',
      instructions: instructions[analysisType],
      input: query,
      files: this.uploadedFiles.map(id => ({ type: 'file', id })),
      temperature: 0.3, // Lower temperature for more factual responses
    });

    console.log(result.output);
    return result.output;
  }

  async compareDocuments(query: string): Promise<string> {
    if (this.uploadedFiles.length < 2) {
      throw new Error('Need at least 2 documents to compare');
    }

    return this.analyze(
      `Compare and contrast the documents regarding: ${query}`,
      'insights'
    );
  }

  getUploadedFileIds(): string[] {
    return [...this.uploadedFiles];
  }
}

// Usage
const analyzer = new DocumentAnalyzer();

// Add multiple documents
await analyzer.addDocument('./reports/quarterly-report.pdf');
await analyzer.addDocument('./reports/annual-summary.docx');

// Analyze documents
const summary = await analyzer.analyze(
  'Provide a comprehensive summary of all documents',
  'summary'
);
console.log(' Summary:', summary);

const insights = await analyzer.analyze(
  'What are the key business decisions and their potential impact?',
  'insights'
);
console.log('💡 Insights:', insights);
```

##  Best Practices

### 1. Use Conversations API for Simplicity
```typescript
// Recommended: Clean and simple
const result = await client.conversations.create({
  model: 'spec-3-turbo',
  instructions: 'You are a helpful assistant.',
  input: userMessage,
});

// More complex: Manual role management
const result = await client.chat.create({
  model: 'spec-3-turbo',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: userMessage }
  ],
});
```

### 2. Handle Errors Gracefully
```typescript
try {
  const result = await client.conversations.create({...});
} catch (error) {
  if (error instanceof RateLimitError) {
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
  }
}
```

### 3. Use Appropriate Models
```typescript
// For quick responses
model: 'spec-3-turbo'

// For complex reasoning
model: 'theta-35'

// For simple tasks
model: 'theta-35-mini'
```

### 4. Optimize File Usage
```typescript
const fileId = await client.files.create(document, 'default');

const result1 = await client.conversations.create({
  files: [{ type: 'file', id: fileId }],
});
```

### 5. Environment Variables
```typescript
const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});
```

##  Testing

```bash
npm test
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

##  License

MIT License - see [LICENSE](LICENSE) file for details.

## Links & Support

- **Website**: [https://www.svector.co.in](https://www.svector.co.in)
- **Documentation**: [API Reference](API.md)
- **Issues**: [GitHub Issues](https://github.com/SVECTOR-CORPORATION/svector-node/issues)
- **Support**: [support@svector.co.in](mailto:support@svector.co.in)
- **npm Package**: [svector-sdk](https://www.npmjs.com/package/svector-sdk)

---

**Built with ❤️ by SVECTOR Corporation** - *Pushing the boundaries of AI, Mathematics, and Computational research*
