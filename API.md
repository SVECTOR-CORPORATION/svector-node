# SVECTOR SDK API Reference

This document provides comprehensive API documentation for the SVECTOR SDK.

## Table of Contents

- [Client Configuration](#client-configuration)
- [Chat Completions](#chat-completions)
- [Models](#models)
- [Files](#files)
- [Knowledge](#knowledge)
- [Error Handling](#error-handling)
- [Utilities](#utilities)
- [Advanced Usage](#advanced-usage)

## Client Configuration

### Constructor Options

```typescript
interface SVECTOROptions {
  apiKey?: string;                    // Your SVECTOR API key
  baseURL?: string;                   // API base URL (default: https://api.svector.co.in)
  maxRetries?: number;                // Maximum retry attempts (default: 2)
  timeout?: number;                   // Request timeout in milliseconds (default: 600000)
  fetch?: typeof fetch;               // Custom fetch implementation
  dangerouslyAllowBrowser?: boolean;  // Allow browser usage (default: false)
}
```

### Example

```typescript
import { SVECTOR } from 'svector';

const client = new SVECTOR({
  apiKey: 'your-api-key',
  maxRetries: 3,
  timeout: 30000,
});
```

## Chat Completions

### create(params, options?)

Creates a chat completion using SVECTOR's Spec-Chat models.

#### Parameters

```typescript
interface ChatCompletionRequest {
  model: string;                      // Model name (e.g., 'spec-3-turbo')
  messages: ChatMessage[];            // Array of conversation messages
  max_tokens?: number;                // Maximum tokens to generate
  temperature?: number;               // Randomness (0.0 to 2.0)
  stream?: boolean;                   // Enable streaming (use createStream instead)
  files?: FileReference[];            // Files for RAG
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'developer';
  content: string;
}

interface FileReference {
  type: 'file' | 'collection';
  id: string;
}
```

#### Response

```typescript
interface ChatCompletionResponse {
  choices: ChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _request_id?: string;
}

interface ChatCompletionChoice {
  message: {
    role: string;
    content: string;
  };
  index: number;
  finish_reason?: string;
}
```

#### Example

```typescript
const response = await client.chat.create({
  model: 'spec-3-turbo',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant that provides accurate and concise answers.'
    },
    {
      role: 'user',
      content: 'Hello, how are you?'
    }
  ],
  max_tokens: 150,
  temperature: 0.7,
});

console.log(response.choices[0].message.content);
```

### createStream(params, options?)

Creates a streaming chat completion.

#### Parameters

Same as `create()` but with `stream: true` required.

#### Response

```typescript
AsyncIterable<StreamEvent>
```

#### Example

```typescript
const stream = await client.chat.createStream({
  model: 'spec-3-turbo',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});

for await (const event of stream) {
  if (event.choices?.[0]?.delta?.content) {
    process.stdout.write(event.choices[0].delta.content);
  }
}
```

### createWithResponse(params, options?)

Creates a chat completion and returns both data and raw response.

#### Response

```typescript
{
  data: ChatCompletionResponse;
  response: Response;
}
```

#### Example

```typescript
const { data, response } = await client.chat.createWithResponse({
  model: 'spec-3-turbo',
  messages: [{ role: 'user', content: 'Hello' }],
});

console.log('Status:', response.status);
console.log('Message:', data.choices[0].message.content);
```

## Models

### list(options?)

Retrieves all available models.

#### Response

```typescript
interface ModelListResponse {
  models: string[];
  _request_id?: string;
}
```

#### Example

```typescript
const models = await client.models.list();
console.log('Available models:', models.models);
```

## Files

### create(file, purpose?, filename?, options?)

Uploads a file for RAG functionality.

#### Parameters

- `file`: File, Buffer, Uint8Array, string, or ReadableStream
- `purpose`: File purpose (default: 'default')
- `filename`: Optional filename
- `options`: Request options

#### Response

```typescript
interface FileUploadResponse {
  file_id: string;
  _request_id?: string;
}
```

#### Examples

```typescript
// From File (browser)
const fileInput = document.getElementById('file') as HTMLInputElement;
const file = fileInput.files[0];
const response = await client.files.create(file);

// From Buffer (Node.js)
import fs from 'fs';
const buffer = fs.readFileSync('document.pdf');
const response = await client.files.create(buffer, 'default', 'document.pdf');

// From stream (Node.js)
const stream = fs.createReadStream('document.pdf');
const response = await client.files.create(stream, 'default');

// From string
const text = 'This is sample text content';
const response = await client.files.create(text, 'default', 'sample.txt');
```

### createFromPath(filePath, purpose?, options?)

Uploads a file from a file path (Node.js only).

#### Example

```typescript
const response = await client.files.createFromPath(
  '/path/to/document.pdf',
  'default'
);
```

## Knowledge

### addFile(knowledgeId, fileId, options?)

Adds a file to a knowledge collection.

#### Parameters

- `knowledgeId`: Collection ID
- `fileId`: File ID from upload
- `options`: Request options

#### Response

```typescript
interface KnowledgeAddFileResponse {
  status: string;
  message?: string;
  _request_id?: string;
}
```

#### Example

```typescript
const result = await client.knowledge.addFile(
  'collection-123',
  'file-456'
);
console.log('Status:', result.status);
```

## Error Handling

### Error Types

```typescript
class SVECTORError extends Error {
  status?: number;
  request_id?: string;
  headers?: Record<string, string>;
}

class APIError extends SVECTORError {}
class AuthenticationError extends SVECTORError {}
class PermissionDeniedError extends SVECTORError {}
class NotFoundError extends SVECTORError {}
class UnprocessableEntityError extends SVECTORError {}
class RateLimitError extends SVECTORError {}
class InternalServerError extends SVECTORError {}
class APIConnectionError extends SVECTORError {}
class APIConnectionTimeoutError extends APIConnectionError {}
```

### Error Handling Example

```typescript
import { 
  AuthenticationError, 
  RateLimitError, 
  APIError 
} from 'svector';

try {
  const response = await client.chat.create({
    model: 'spec-3-turbo',
    messages: [{ role: 'user', content: 'Hello' }],
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof APIError) {
    console.error(`API error: ${error.message} (${error.status})`);
  }
}
```

## Utilities

### toFile(value, filename?, options?)

Converts various input types to File objects.

#### Parameters

- `value`: Buffer, Uint8Array, string, ReadableStream, or Response
- `filename`: Optional filename
- `options`: Optional file options

#### Example

```typescript
import { toFile } from 'svector';

const file = await toFile('Hello world', 'hello.txt', { type: 'text/plain' });
const response = await client.files.create(file);
```

## Advanced Usage

### Request Options

All API methods accept optional request options:

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  query?: Record<string, string>;
  maxRetries?: number;
  timeout?: number;
}
```

#### Example

```typescript
const response = await client.chat.create(
  {
    model: 'spec-3-turbo',
    messages: [{ role: 'user', content: 'Hello' }],
  },
  {
    timeout: 30000,
    maxRetries: 1,
    headers: { 'X-Custom-Header': 'value' },
  }
);
```

### Generic HTTP Methods

For undocumented endpoints or custom requests:

```typescript
// GET request
const data = await client.get<ResponseType>('/api/custom');

// POST request
const data = await client.post<ResponseType>('/api/custom', { key: 'value' });

// PUT request
const data = await client.put<ResponseType>('/api/custom', { key: 'value' });

// DELETE request
const data = await client.delete<ResponseType>('/api/custom');
```

### Custom Fetch Implementation

```typescript
import fetch from 'node-fetch';

const client = new SVECTOR({
  apiKey: 'your-key',
  fetch: fetch as any,
});
```

### Environment-Specific Usage

#### Node.js

```typescript
import { SVECTOR } from 'svector';
// API key from environment variable
const client = new SVECTOR();
```

#### Browser (with bundler)

```typescript
import { SVECTOR } from 'svector';

const client = new SVECTOR({
  apiKey: 'your-key',
  dangerouslyAllowBrowser: true,
});
```

#### Deno

```typescript
import { SVECTOR } from 'npm:svector';

const client = new SVECTOR({
  apiKey: Deno.env.get('SVECTOR_API_KEY'),
});
```

#### Bun

```typescript
import { SVECTOR } from 'svector';

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});
```

### RAG (Retrieval Augmented Generation)

#### Single File RAG

```typescript
// Upload file
const fileResponse = await client.files.create(fileData, 'default');

// Use in chat
const chatResponse = await client.chat.create({
  model: 'spec-3-turbo',
  messages: [{ role: 'user', content: 'Summarize this document' }],
  files: [{ type: 'file', id: fileResponse.file_id }],
});
```

#### Knowledge Collection RAG

```typescript
// Add files to collection
await client.knowledge.addFile('collection-id', 'file-id-1');
await client.knowledge.addFile('collection-id', 'file-id-2');

// Use collection in chat
const chatResponse = await client.chat.create({
  model: 'spec-3-turbo',
  messages: [{ role: 'user', content: 'What insights can you provide?' }],
  files: [{ type: 'collection', id: 'collection-id' }],
});
```

## Rate Limits and Best Practices

### Rate Limiting

The SVECTOR API has rate limits that vary by plan:
- Free tier: 10 requests/minute
- Pro plan: 100 requests/minute  
- Enterprise: 1000+ requests/minute

### Best Practices

1. **Handle Rate Limits**: Use the built-in retry logic or implement your own backoff strategy.

2. **Set Appropriate Timeouts**: Adjust timeouts based on your use case.

3. **Monitor Token Usage**: Track token consumption for cost optimization.

4. **Implement Error Handling**: Always handle potential errors gracefully.

5. **Use Streaming for Long Responses**: For lengthy responses, use streaming to improve user experience.

6. **Secure API Keys**: Never expose API keys in client-side code in production.

## Support

For additional help:
- 📖 [Full Documentation](https://platform.svector.co.in)
-  [SVECTOR Website](https://www.svector.co.in)
- Support: support@svector.co.in
-  [Report Issues](https://github.com/SVECTOR-CORPORATION/svector-node/issues)
