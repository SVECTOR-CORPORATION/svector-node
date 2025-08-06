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
##  Vision & Image Analysis

SVECTOR provides powerful, proprietary vision capabilities for analyzing, understanding, and processing images. Our Vision API supports multiple input methods and provides specialized functions for different use cases, all optimized for SVECTOR's advanced AI models.

### Why SVECTOR Vision?

- **Advanced AI Models**: Powered by SVECTOR's proprietary vision models (spec-3-turbo, theta-35)
- **Flexible Input Methods**: URL, base64, and file ID support
- **Specialized Functions**: OCR, accessibility, object detection, and comparison
- **Production Ready**: Built-in rate limiting, error handling, and batch processing
- **Multi-Platform**: Works across Node.js, Deno, browsers, and edge environments

### Supported Image Formats

- **PNG** (.png)
- **JPEG** (.jpeg, .jpg)  
- **WEBP** (.webp)
- **GIF** (.gif) - Non-animated only

### Basic Image Analysis

#### Analyze Image from URL

```typescript
import { SVECTOR } from "jsr:@svector/svector";

const client = new SVECTOR({
  apiKey: Deno.env.get("SVECTOR_API_KEY"),
});

const result = await client.vision.analyzeFromUrl(
  'https://example.com/nature-scene.jpg',
  'What do you see in this image? Describe the scene in detail.',
  {
    model: 'spec-3-turbo',
    max_tokens: 500,
    detail: 'high' // 'low', 'high', or 'auto'
  }
);

console.log(result.analysis);
```

#### Analyze Image from Local File (Deno)

```typescript
// Method 1: Using base64 encoding
const imageData = await Deno.readFile('./image.jpg');
const base64Image = btoa(String.fromCharCode(...imageData));

const result = await client.vision.analyzeFromBase64(
  base64Image,
  'Identify all objects and people in this image.',
  {
    model: 'spec-3-turbo',
    max_tokens: 1000,
    temperature: 0.3,
    detail: 'high'
  }
);

console.log(result.analysis);
```

#### Analyze Uploaded File by ID

```typescript
// First upload the file
const imageData = await Deno.readFile('./chart.png');
const fileResponse = await client.files.create(
  imageData,
  'default',
  'chart.png'
);

// Then analyze using file ID
const result = await client.vision.analyzeFromFileId(
  fileResponse.file_id,
  'Analyze this chart. What insights can you extract?',
  {
    model: 'spec-3-turbo',
    max_tokens: 800
  }
);

console.log(result.analysis);
```

### Advanced Vision Features

#### Extract Text from Images (OCR)

```typescript
const result = await client.vision.extractText({
  image_url: 'https://example.com/document-image.png',
  model: 'spec-3-turbo',
  max_tokens: 1000
});

console.log('Extracted text:', result.analysis);
```

#### Accessibility Descriptions

```typescript
const result = await client.vision.describeForAccessibility({
  image_url: 'https://example.com/complex-chart.png',
  model: 'spec-3-turbo'
});

console.log('Alt text:', result.analysis);
// Provides detailed description suitable for screen readers
```

#### Object Detection

```typescript
const result = await client.vision.detectObjects(
  { image_url: 'https://example.com/street-scene.jpg' },
  ['cars', 'people', 'buildings', 'traffic signs'] // Specific objects to detect
);

console.log('Detected objects:', result.analysis);
```

#### Compare Multiple Images

```typescript
const result = await client.vision.compareImages([
  { url: 'https://example.com/before.jpg' },
  { url: 'https://example.com/after.jpg' }
], 'Compare these before and after images. What changes do you notice?', {
  model: 'spec-3-turbo',
  max_tokens: 800
});

console.log('Comparison:', result.analysis);
```

### Vision with Chat Completions API

For more control over the conversation structure:

```typescript
const completion = await client.chat.create({
  model: 'spec-3-turbo',
  messages: [
    {
      role: 'system',
      content: 'You are a medical imaging specialist. Analyze images with clinical precision.'
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What do you observe in this medical scan?'
        },
        {
          type: 'image_url',
          image_url: {
            url: 'data:image/jpeg;base64,' + base64MedicalImage,
            detail: 'high'
          }
        }
      ]
    }
  ],
  max_tokens: 1000
});
```

### Batch Image Analysis

Process multiple images efficiently:

```typescript
const imageUrls = [
  'https://example.com/product1.jpg',
  'https://example.com/product2.jpg',
  'https://example.com/product3.jpg'
];

const analyses = [];

for (const [index, url] of imageUrls.entries()) {
  console.log(`Analyzing image ${index + 1}/${imageUrls.length}...`);
  
  const result = await client.vision.analyzeFromUrl(
    url,
    'Describe this product and its key features.',
    {
      model: 'spec-3-turbo',
      max_tokens: 300
    }
  );
  
  analyses.push({
    image: url,
    analysis: result.analysis,
    tokens: result.usage?.total_tokens
  });
  
  // Rate limiting courtesy
  await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log('Batch analysis complete:', analyses);
```

### Advanced Response Format

SVECTOR provides an advanced response format for complex vision tasks:

```typescript
const response = await client.vision.createResponse({
  model: "spec-3-turbo",
  input: [{
    role: "user",
    content: [
      { type: "input_text", text: "what's in this image?" },
      {
        type: "input_image",
        image_url: "https://example.com/image.jpg",
      },
    ],
  }],
});

console.log('Analysis:', response.output_text);
```

### Vision API Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `image_url` | string | Direct URL to image | - |
| `image_base64` | string | Base64 encoded image data | - |
| `file_id` | string | Uploaded file ID | - |
| `prompt` | string | Analysis instructions | Auto-generated |
| `model` | string | Model to use | 'spec-3-turbo' |
| `max_tokens` | number | Maximum response tokens | 1000 |
| `temperature` | number | Response creativity (0-1) | 0.7 |
| `detail` | string | Image analysis detail level | 'auto' |

### Detail Levels

- **`low`** - Faster processing, basic analysis
- **`high`** - Detailed analysis, slower processing  
- **`auto`** - Automatically choose based on image

### Complete Vision Example (Deno)

```typescript
#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read

import { SVECTOR } from "jsr:@svector/svector";

class VisionAnalyzer {
  private client: SVECTOR;

  constructor(apiKey: string) {
    this.client = new SVECTOR({ apiKey });
  }

  async analyzeImage(imagePath: string, prompt?: string): Promise<string> {
    try {
      // Upload file and analyze by ID
      const imageData = await Deno.readFile(imagePath);
      const fileResponse = await this.client.files.create(
        imageData,
        'default',
        imagePath.split('/').pop()
      );
      
      const result = await this.client.vision.analyzeFromFileId(
        fileResponse.file_id,
        prompt || 'Provide a comprehensive analysis of this image.',
        {
          model: 'spec-3-turbo',
          max_tokens: 800,
          detail: 'high'
        }
      );
      
      return result.analysis;
    } catch (error) {
      console.error('Vision analysis failed:', error);
      throw error;
    }
  }

  async extractText(imagePath: string): Promise<string> {
    const imageData = await Deno.readFile(imagePath);
    const base64Image = btoa(String.fromCharCode(...imageData));
    
    const result = await this.client.vision.extractText({
      image_base64: base64Image,
      model: 'spec-3-turbo'
    });
    
    return result.analysis;
  }

  async compareImages(image1Path: string, image2Path: string): Promise<string> {
    const image1Data = await Deno.readFile(image1Path);
    const image2Data = await Deno.readFile(image2Path);
    
    const image1 = btoa(String.fromCharCode(...image1Data));
    const image2 = btoa(String.fromCharCode(...image2Data));
    
    const result = await this.client.vision.compareImages([
      { base64: image1 },
      { base64: image2 }
    ], 'Compare these two images and describe the differences.');
    
    return result.analysis;
  }
}

// Usage
const analyzer = new VisionAnalyzer(Deno.env.get("SVECTOR_API_KEY")!);

const analysis = await analyzer.analyzeImage('./photo.jpg');
console.log('📸 Analysis:', analysis);

const extractedText = await analyzer.extractText('./document.png');
console.log('📄 Extracted text:', extractedText);

const comparison = await analyzer.compareImages('./before.jpg', './after.jpg');
console.log('🔄 Comparison:', comparison);
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
  baseURL: "https://api.svector.co.in", // This is now the default
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
