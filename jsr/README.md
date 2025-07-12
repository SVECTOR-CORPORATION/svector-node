# @svector/svector

[![JSR](https://jsr.io/badges/@svector/svector)](https://jsr.io/@svector/svector)
[![npm version](https://img.shields.io/npm/v/svector-sdk.svg)](https://www.npmjs.com/package/svector-sdk)

**Official TypeScript/JavaScript SDK for accessing SVECTOR APIs**

SVECTOR develops high-performance AI models and automation solutions, specializing in artificial intelligence, mathematical computing, and computational research. This SDK provides programmatic access to SVECTOR's API services through type-safe JavaScript/TypeScript interfaces, completion endpoints, document processing capabilities, and additional AI model integrations.

## Quick Start

### For Deno

```typescript
import { SVECTOR } from "jsr:@svector/svector";

const client = new SVECTOR({
  apiKey: Deno.env.get("SVECTOR_API_KEY"),
});

// Conversational API
const response = await client.conversations.create({
  model: "spec-3-turbo",
  instructions: "You are a helpful AI assistant.",
  input: "What is artificial intelligence?",
});

console.log(response.output);
```

### For Node.js/Bun

```typescript
import { SVECTOR } from "@svector/svector";

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});

const response = await client.conversations.create({
  model: "spec-3-turbo",
  instructions: "You are a helpful AI assistant.",
  input: "What is artificial intelligence?",
});

console.log(response.output);
```

### For Browser

```typescript
import { SVECTOR } from "https://esm.sh/@svector/svector";

const client = new SVECTOR({
  apiKey: "your-api-key",
  dangerouslyAllowBrowser: true,
});
```

## Installation

### Deno

```ts
// No installation needed, import directly:
import { SVECTOR } from "jsr:@svector/svector";
```

### npm

```bash
npx jsr add @svector/svector
# or
npm i svector-sdk
```

### pnpm

```bash
pnpm i jsr:@svector/svector
```

### Yarn

```bash
yarn add jsr:@svector/svector
```

### vlt (Velte)

```bash
vlt install jsr:@svector/svector
```

### Bun

```bash
bunx jsr add @svector/svector
# or
bun add jsr:@svector/svector
```

##  Core Features

- **Conversations API** - Simple instructions + input interface
- **Advanced Chat Completions** - Full control with role-based messages  
- **Real-time Streaming** - Server-sent events for live responses
- **File Processing** - Upload and process documents (PDF, DOCX, TXT, etc.)
- **Knowledge Collections** - Organize files for enhanced RAG
- **Type Safety** - Full TypeScript support with IntelliSense
- **Universal** - Works in Deno, Node.js, Bun, and browsers
- **Robust Error Handling** - Comprehensive error types and retry logic

##  Conversations API

The **Conversations API** provides a user-friendly interface. Just provide instructions and input!

```typescript
const response = await client.conversations.create({
  model: "spec-3-turbo",
  instructions: "You are a helpful coding assistant.",
  input: "How do I create a function in TypeScript?",
  temperature: 0.7,
});

console.log(response.output);
```

### With Context
```typescript
const response = await client.conversations.create({
  model: "spec-3-turbo", 
  instructions: "You are a programming tutor.",
  input: "Can you show me an example?",
  context: [
    "How do I create a function in TypeScript?",
    "You can create a function using the function keyword..."
  ],
});
```

### Streaming Conversations
```typescript
const stream = await client.conversations.createStream({
  model: "spec-3-turbo",
  instructions: "You are a creative storyteller.",
  input: "Tell me a short story about AI.",
  stream: true,
});

for await (const event of stream) {
  if (!event.done) {
    console.log(event.content);
  }
}
```

##   Chat Completions API

For advanced use cases with full control:

```typescript
const response = await client.chat.create({
  model: "spec-3-turbo",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello!" }
  ],
  temperature: 0.7,
});

console.log(response.choices[0].message.content);
```

### Streaming Chat
```typescript
const stream = await client.chat.createStream({
  model: "spec-3-turbo",
  messages: [
    { role: "system", content: "You are helpful." },
    { role: "user", content: "Explain quantum computing" }
  ],
  stream: true,
});

for await (const event of stream) {
  if (event.choices?.[0]?.delta?.content) {
    console.log(event.choices[0].delta.content);
  }
}
```

## Document-based Conversation

Upload documents for enhanced AI responses:

### Basic Document Analysis
```typescript
async function analyzeDocument(filePath: string, question = "Analyze this document and provide key findings.") {
  const fileContent = await Deno.readFile(filePath);
  
  const fileResponse = await client.files.create(
    fileContent,
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

### Multi-Document Analysis
```typescript
async function analyzeMultipleDocuments(filePaths: string[], question: string) {
  const documents = [];
  
  for (const filePath of filePaths) {
    const fileContent = await Deno.readFile(filePath);
    const fileResponse = await client.files.create(
      fileContent,
      'default',
      filePath.split('/').pop()
    );
    documents.push(`${filePath}: ${fileResponse.data.content}`);
  }
  
  const result = await client.conversations.create({
    model: 'spec-3-turbo',
    instructions: 'You are a document analyst. Compare and analyze multiple documents.',
    input: `${question}\n\nDocuments:\n${documents.join('\n\n')}`,
    temperature: 0.3,
  });

  console.log(result.output);
  return result.output;
}

await analyzeMultipleDocuments(['report1.pdf', 'report2.pdf'], 'Compare these reports');
```

## Available Models

- **`spec-3-turbo`** - Fast, efficient for most use cases
- **`spec-3`** - Standard model with balanced performance
- **`theta-35`** - Advanced model for complex reasoning  
- **`theta-35-mini`** - Lightweight model for simple tasks

```typescript
// List all available models
const models = await client.models.list();
console.log(models.models);
```

##  Error Handling

```typescript
import { SVECTOR, AuthenticationError, RateLimitError } from "jsr:@svector/svector";

try {
  const response = await client.conversations.create({
    model: "spec-3-turbo",
    instructions: "You are helpful.",
    input: "Hello!",
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Invalid API key");
  } else if (error instanceof RateLimitError) {
    console.error("Rate limit exceeded");
  } else {
    console.error("API error:", error.message);
  }
}
```

##  Configuration

```typescript
const client = new SVECTOR({
  apiKey: "your-api-key",
  baseURL: "https://api.svector.co.in",
  timeout: 30000,
  maxRetries: 3,
  dangerouslyAllowBrowser: true,
});
```

## Complete Deno Example

```typescript
#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read

import { SVECTOR } from "jsr:@svector/svector";

const client = new SVECTOR({
  apiKey: Deno.env.get("SVECTOR_API_KEY")!,
});

// Basic conversation
const response = await client.conversations.create({
  model: "spec-3-turbo",
  instructions: "You are a helpful assistant.",
  input: "What's the weather like on Mars?",
});

console.log("AI Response:", response.output);

// Document analysis (if document.pdf exists)
try {
  const fileContent = await Deno.readFile("document.pdf");
  const fileResponse = await client.files.create(fileContent, 'default', 'document.pdf');
  
  const analysis = await client.conversations.create({
    model: "spec-3-turbo",
    instructions: "You are a document analyst.",
    input: `Analyze this document: ${fileResponse.data.content}`,
  });
  
  console.log("Document Analysis:", analysis.output);
} catch (error) {
  console.log("No document found, skipping analysis");
}
```

##  API Reference

### SVECTOR Client
- `new SVECTOR(options)` - Create a client instance
- `client.conversations` - conversations API
- `client.chat` - Advanced chat completions
- `client.models` - Model management
- `client.files` - File upload and management
- `client.knowledge` - Knowledge collection management

### Error Types
- `SVECTORError` - Base error class
- `APIError` - API-related errors
- `AuthenticationError` - Invalid API key
- `RateLimitError` - Rate limit exceeded
- `NotFoundError` - Resource not found
- `UnprocessableEntityError` - Invalid request data

## Links & Support

- **Website**: [https://www.svector.co.in](https://www.svector.co.in)
- **Documentation**: [https://platform.svector.co.in](https://platform.svector.co.in)
- **Support**: [support@svector.co.in](mailto:support@svector.co.in)
- **Issues**: [GitHub Issues](https://github.com/SVECTOR-CORPORATION/svector-node/issues)
- **JSR Package**: [@svector/svector](https://jsr.io/@svector/svector)
- **npm Package**: [svector-sdk](https://www.npmjs.com/package/svector-sdk)

##  License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by SVECTOR Corporation** - *Pushing the boundaries of AI, Mathematics, and Computational research*
