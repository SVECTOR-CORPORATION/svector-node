# @svector/svector

[![JSR](https://jsr.io/badges/@svector/svector)](https://jsr.io/@svector/svector)
[![npm version](https://img.shields.io/npm/v/svector-sdk.svg)](https://www.npmjs.com/package/svector-sdk)

**Official TypeScript/JavaScript SDK for SVECTOR AI Models**

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
  model: "spec-3-turbo:latest",
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
  model: "spec-3-turbo:latest",
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

##  Installation

### Deno
```bash
# No installation needed, import directly:
import { SVECTOR } from "jsr:@svector/svector";
```

### Node.js/npm
```bash
npx jsr add @svector/svector
# or
npm install @svector/svector
```

### Bun
```bash
bunx jsr add @svector/svector
# or
bun add @svector/svector
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
  model: "spec-3-turbo:latest",
  instructions: "You are a helpful coding assistant.",
  input: "How do I create a function in TypeScript?",
  temperature: 0.7,
});

console.log(response.output);
```

### With Context
```typescript
const response = await client.conversations.create({
  model: "spec-3-turbo:latest", 
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
  model: "spec-3-turbo:latest",
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
  model: "spec-3-turbo:latest",
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
  model: "spec-3-turbo:latest",
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

##  File Processing & RAG

Upload documents for enhanced AI responses:

```typescript
// Upload a file
const fileResponse = await client.files.create(
  await Deno.readFile("document.pdf"),
  "rag",
  "document.pdf"
);

// Ask questions about the document
const response = await client.conversations.create({
  model: "spec-3-turbo:latest",
  instructions: "You are a document analyst.",
  input: "What are the key findings in this document?",
  files: [{ type: "file", id: fileResponse.file_id }],
});
```

## Available Models

- **`spec-3-turbo:latest`** - Fast, efficient for most use cases
- **`spec-3:latest`** - Standard model with balanced performance
- **`theta-35:latest`** - Advanced model for complex reasoning  
- **`theta-35-mini:latest`** - Lightweight model for simple tasks

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
    model: "spec-3-turbo:latest",
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
  baseURL: "https://spec-chat.tech",  // Custom endpoint
  timeout: 30000,                     // 30 second timeout
  maxRetries: 3,                      // Retry failed requests
  dangerouslyAllowBrowser: true,      // Allow browser usage
});
```

##  Deno Example

```typescript
#!/usr/bin/env -S deno run --allow-env --allow-net

import { SVECTOR } from "jsr:@svector/svector";

const client = new SVECTOR({
  apiKey: Deno.env.get("SVECTOR_API_KEY")!,
});

const response = await client.conversations.create({
  model: "spec-3-turbo:latest",
  instructions: "You are a helpful assistant.",
  input: "What's the weather like on Mars?",
});

console.log("AI Response:", response.output);
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

## 🔗 Links & Support

- **Website**: [https://www.svector.co.in](https://www.svector.co.in)
- **Documentation**: [https://platform.svector.co.in](https://platform.svector.co.in)
- **Support**: [support@svector.co.in](mailto:support@svector.co.in)
- **Issues**: [GitHub Issues](https://github.com/SVECTOR-CORPORATION/svector-sdk/issues)
- **JSR Package**: [@svector/svector](https://jsr.io/@svector/svector)
- **npm Package**: [svector-sdk](https://www.npmjs.com/package/svector-sdk)

##  License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by SVECTOR Corporation** - *Pushing the boundaries of AI, Mathematics, and Computational research*
