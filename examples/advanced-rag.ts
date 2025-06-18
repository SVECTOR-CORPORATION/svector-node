/**
 * Advanced RAG example with error handling and multiple file formats
 */
import fs from 'fs';
import path from 'path';
import { SVECTOR, toFile } from '../src';

async function advancedRAGExample() {
  const client = new SVECTOR({
    apiKey: process.env.SVECTOR_API_KEY,
  });

  try {
    console.log('🚀 Advanced SVECTOR RAG Example\n');

    // Create multiple sample documents
    const documents = [
      {
        name: 'company-overview.txt',
        content: `
SVECTOR Corporation - Company Overview

SVECTOR is a pioneering artificial intelligence company founded in 2023, specializing in 
advanced language models and conversational AI solutions. Our flagship product, Spec-Chat, 
represents a breakthrough in AI technology, offering:

• Advanced natural language understanding and generation
• Retrieval Augmented Generation (RAG) capabilities
• Multi-modal processing for text, images, and documents
• Enterprise-grade security and scalability
• Seamless integration with existing business workflows

Our mission is to democratize access to cutting-edge AI technology while maintaining 
the highest standards of safety, reliability, and performance.
        `
      },
      {
        name: 'technical-specs.txt',
        content: `
SVECTOR Spec-Chat Technical Specifications

Model Architecture:
- Based on transformer architecture with custom optimizations
- Context window: 32,768 tokens
- Training data: Curated dataset up to 2024
- Languages: 95+ languages supported
- Response time: < 500ms average

API Capabilities:
- RESTful API with OpenAI-compatible endpoints
- Streaming responses via Server-Sent Events
- File upload and processing for RAG
- Knowledge collection management
- Rate limiting: 1000 requests/minute
- Authentication: Bearer token (API key)

Supported File Formats:
- Text files (.txt, .md, .rtf)
- Documents (.pdf, .docx, .odt)
- Spreadsheets (.csv, .xlsx)
- Code files (.py, .js, .ts, .java, etc.)
        `
      },
      {
        name: 'pricing-info.txt',
        content: `
SVECTOR Pricing and Plans

Free Tier:
- 1,000 API calls per month
- Basic chat completions
- Community support
- Rate limit: 10 requests/minute

Pro Plan - $29/month:
- 100,000 API calls per month
- RAG functionality included
- File uploads up to 10MB
- Email support
- Rate limit: 100 requests/minute

Enterprise Plan - Custom pricing:
- Unlimited API calls
- Custom model fine-tuning
- Dedicated support
- SLA guarantees
- On-premise deployment options
- Rate limit: 1000+ requests/minute

All plans include:
- 99.9% uptime SLA
- Global CDN delivery
- GDPR compliance
- SOC 2 Type II certification
        `
      }
    ];

    console.log('📁 Creating and uploading documents...');
    const fileIds: string[] = [];

    // Upload documents using different methods
    for (const [index, doc] of documents.entries()) {
      const tempFile = path.join(__dirname, doc.name);
      fs.writeFileSync(tempFile, doc.content);

      try {
        let fileResponse;
        
        if (index === 0) {
          // Method 1: Upload from file stream
          fileResponse = await client.files.create(
            fs.createReadStream(tempFile),
            'rag',
            doc.name
          );
        } else if (index === 1) {
          // Method 2: Upload from buffer
          const buffer = fs.readFileSync(tempFile);
          fileResponse = await client.files.create(buffer, 'rag', doc.name);
        } else {
          // Method 3: Upload using toFile utility
          const fileContent = fs.readFileSync(tempFile, 'utf8');
          const file = await toFile(fileContent, doc.name, { type: 'text/plain' });
          fileResponse = await client.files.create(file, 'rag');
        }

        fileIds.push(fileResponse.file_id);
        console.log(`   ✅ Uploaded ${doc.name} -> ${fileResponse.file_id}`);
        
        // Clean up temp file
        fs.unlinkSync(tempFile);
      } catch (error) {
        console.error(`   ❌ Failed to upload ${doc.name}:`, error);
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    }

    if (fileIds.length === 0) {
      throw new Error('No files were uploaded successfully');
    }

    console.log(`\n📚 Successfully uploaded ${fileIds.length} documents\n`);

    // Example 1: Query using individual files
    console.log('🔍 Example 1: Querying individual files');
    
    const questions = [
      {
        question: "What is SVECTOR Corporation and when was it founded?",
        fileIndex: 0, // company-overview.txt
      },
      {
        question: "What are the technical specifications of Spec-Chat?",
        fileIndex: 1, // technical-specs.txt
      },
      {
        question: "What pricing plans does SVECTOR offer?",
        fileIndex: 2, // pricing-info.txt
      }
    ];

    for (const { question, fileIndex } of questions) {
      if (fileIds[fileIndex]) {
        try {
          console.log(`\n❓ Question: ${question}`);
          
          const response = await client.chat.create({
            model: 'spec-3-turbo:latest',
            messages: [
              { role: 'user', content: question }
            ],
            files: [
              { type: 'file', id: fileIds[fileIndex] }
            ],
            temperature: 0.3,
          });

          console.log(`💬 Answer: ${response.choices[0].message.content}\n`);
        } catch (error) {
          console.error(`❌ Error processing question: ${error}\n`);
        }
      }
    }

    // Example 2: Query using multiple files (simulating knowledge collection)
    console.log('🔍 Example 2: Cross-document analysis');
    
    const crossDocQuestions = [
      "Compare SVECTOR's pricing with their technical capabilities. What value does each plan provide?",
      "Based on all the information provided, would SVECTOR be suitable for an enterprise with high-volume AI needs?",
      "What are the key differentiators of SVECTOR compared to other AI providers?"
    ];

    for (const question of crossDocQuestions) {
      try {
        console.log(`\n❓ Cross-doc Question: ${question}`);
        
        const response = await client.chat.create({
          model: 'spec-3-turbo:latest',
          messages: [
            { 
              role: 'developer', 
              content: 'You are an AI assistant that provides comprehensive answers based on the provided documents. Always cite which documents you\'re referencing.' 
            },
            { role: 'user', content: question }
          ],
          files: fileIds.map(id => ({ type: 'file', id })),
          temperature: 0.4,
          max_tokens: 500,
        });

        console.log(`💬 Answer: ${response.choices[0].message.content}\n`);
      } catch (error) {
        console.error(`❌ Error processing cross-doc question: ${error}\n`);
      }
    }

    // Example 3: Streaming response with RAG
    console.log('🔍 Example 3: Streaming response with RAG');
    
    try {
      console.log('\n❓ Streaming Question: Create a comprehensive summary of SVECTOR based on all available information\n');
      console.log('💬 Streaming Answer: ');
      
      const stream = await client.chat.createStream({
        model: 'spec-3-turbo:latest',
        messages: [
          { 
            role: 'user', 
            content: 'Create a comprehensive executive summary of SVECTOR Corporation, including their technology, pricing, and key benefits. Make it suitable for a business decision-maker.' 
          }
        ],
        files: fileIds.map(id => ({ type: 'file', id })),
        temperature: 0.5,
        stream: true,
      });

      for await (const event of stream) {
        if (event.choices?.[0]?.delta?.content) {
          process.stdout.write(event.choices[0].delta.content);
        }
      }
      console.log('\n');
    } catch (error) {
      console.error(`❌ Error in streaming example: ${error}`);
    }

    // Example 4: Error handling and edge cases
    console.log('\n🛠️  Example 4: Error handling demonstration');
    
    try {
      // Try to use a non-existent file ID
      await client.chat.create({
        model: 'spec-3-turbo:latest',
        messages: [
          { role: 'user', content: 'This should fail' }
        ],
        files: [
          { type: 'file', id: 'non-existent-file-id' }
        ],
      });
    } catch (error) {
      console.log(`✅ Properly caught error for invalid file ID: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
    }

    console.log('\n✨ Advanced RAG example completed successfully!');
    console.log('\nSummary:');
    console.log(`   • Uploaded ${fileIds.length} documents using different methods`);
    console.log(`   • Demonstrated single-file RAG queries`);
    console.log(`   • Showed cross-document analysis capabilities`);
    console.log(`   • Tested streaming responses with RAG`);
    console.log(`   • Validated error handling`);

  } catch (error) {
    console.error('\n❌ Example failed:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  if (!process.env.SVECTOR_API_KEY) {
    console.error('❌ Please set the SVECTOR_API_KEY environment variable');
    process.exit(1);
  }
  
  advancedRAGExample().catch(console.error);
}

export { advancedRAGExample };
