/**
 * Complete SVECTOR SDK feature demonstration
 * This example showcases all major SDK capabilities
 */
import {
    APIError,
    AuthenticationError,
    RateLimitError,
    SVECTOR,
    toFile
} from '../src';

async function comprehensiveExample() {
  console.log('SVECTOR SDK - Complete Feature Demonstration\n');

  // Initialize client
  const client = new SVECTOR({
    apiKey: process.env.SVECTOR_API_KEY,
    timeout: 30000, // 30 second timeout
    maxRetries: 3,  // Retry up to 3 times
  });

  try {
    // 1. Basic Chat Completion
    console.log('  1. Basic Chat Completion');
    console.log('─'.repeat(50));
    
    const basicResponse = await client.chat.create({
      model: 'spec-3-turbo',
      messages: [
        { role: 'system', content: 'You are a knowledgeable science educator who explains complex topics in simple terms.' },
        { role: 'user', content: 'Explain quantum computing in simple terms' }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    console.log('Question: Explain quantum computing in simple terms');
    console.log(`Answer: ${basicResponse.choices[0].message.content}`);
    console.log(`Request ID: ${basicResponse._request_id}\n`);

    // 2. Multi-turn Conversation
    console.log('2. Multi-turn Conversation');
    console.log('─'.repeat(50));
    
    const conversationResponse = await client.chat.create({
      model: 'spec-3-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful programming assistant that provides clear code examples.' },
        { role: 'user', content: 'How do I reverse a string in Python?' },
      ],
      temperature: 0.5,
    });

    console.log('Question: How do I reverse a string in Python?');
    console.log(`Answer: ${conversationResponse.choices[0].message.content}\n`);

    // 3. Streaming Response
    console.log(' 3. Streaming Response');
    console.log('─'.repeat(50));
    console.log('Question: Write a short poem about artificial intelligence');
    console.log('Streaming Answer: ');
    
    const stream = await client.chat.createStream({
      model: 'spec-3-turbo',
      messages: [
        { role: 'system', content: 'You are a creative poet who writes beautiful verses about technology.' },
        { role: 'user', content: 'Write a short poem about artificial intelligence' }
      ],
      temperature: 0.8,
      stream: true,
    });

    for await (const event of stream) {
      if (event.choices?.[0]?.delta?.content) {
        process.stdout.write(event.choices[0].delta.content);
      }
    }
    console.log('\n');

    // 4. Model Listing
    console.log('4. Available Models');
    console.log('─'.repeat(50));
    
    const models = await client.models.list();
    console.log('Available models:');
    models.models.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model}`);
    });
    console.log('');

    // 5. File Upload (different methods)
    console.log(' 5. File Upload Methods');
    console.log('─'.repeat(50));
    
    // Method 1: Upload from string
    const textContent = `
# SVECTOR SDK Example Document

This is a sample document to demonstrate RAG capabilities.

## Key Features:
- Advanced AI models
- Easy integration
- Comprehensive documentation
- Production-ready
    `;
    
    const fileFromString = await toFile(textContent, 'example-doc.md', { type: 'text/markdown' });
    const uploadResponse1 = await client.files.create(fileFromString, 'default');
    console.log(`File uploaded from string: ${uploadResponse1.file_id}`);

    // Method 2: Upload from buffer
    const buffer = Buffer.from('This is a sample text file for testing.', 'utf-8');
    const uploadResponse2 = await client.files.create(buffer, 'default', 'sample.txt');
    console.log(`File uploaded from buffer: ${uploadResponse2.file_id}`);
    
    const fileIds = [uploadResponse1.file_id, uploadResponse2.file_id];

    // 6. RAG with Individual File
    console.log('\n 6. RAG with Individual File');
    console.log('─'.repeat(50));
    
    const ragResponse = await client.chat.create({
      model: 'spec-3-turbo',
      messages: [
        { role: 'user', content: 'What are the key features mentioned in the document?' }
      ],
      files: [
        { type: 'file', id: fileIds[0] }
      ],
      temperature: 0.3,
    });

    console.log('Question: What are the key features mentioned in the document?');
    console.log(`Answer: ${ragResponse.choices[0].message.content}\n`);

    // 7. Knowledge Collection (simulated with multiple files)
    console.log(' 7. Multi-file RAG (Knowledge Collection Simulation)');
    console.log('─'.repeat(50));
    
    const multiFileResponse = await client.chat.create({
      model: 'spec-3-turbo',
      messages: [
        { role: 'user', content: 'Summarize all the information from the uploaded files' }
      ],
      files: fileIds.map(id => ({ type: 'file', id })),
      temperature: 0.4,
    });

    console.log('Question: Summarize all the information from the uploaded files');
    console.log(`Answer: ${multiFileResponse.choices[0].message.content}\n`);

    // 8. Error Handling Demo
    console.log('⚠️  8. Error Handling');
    console.log('─'.repeat(50));
    
    try {
      await client.chat.create({
        model: 'non-existent-model',
        messages: [{ role: 'user', content: 'test' }],
      });
    } catch (error) {
      if (error instanceof APIError) {
        console.log(`Caught API error: ${error.constructor.name} - ${error.message}`);
        console.log(`   Status: ${error.status}`);
        console.log(`   Request ID: ${error.request_id}`);
      }
    }

    // 9. Request with Response Access
    console.log('\n🔍 9. Access Raw Response');
    console.log('─'.repeat(50));
    
    const { data, response } = await client.chat.createWithResponse({
      model: 'spec-3-turbo',
      messages: [
        { role: 'user', content: 'What is the meaning of life?' }
      ],
      temperature: 0.7,
    });

    console.log('Question: What is the meaning of life?');
    console.log(`Answer: ${data.choices[0].message.content}`);
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log(`Content type: ${response.headers.get('content-type')}\n`);

    // 10. Generic HTTP Methods
    console.log(' 10. Generic HTTP Methods');
    console.log('─'.repeat(50));
    
    const modelsViaGet = await client.get<{ models: string[] }>('/api/models');
    console.log(`GET request successful - found ${modelsViaGet.models?.length || 0} models`);

    // 11. Custom Configuration Demo
    console.log('\n  11. Custom Configuration');
    console.log('─'.repeat(50));
    
    const customClient = new SVECTOR({
      apiKey: process.env.SVECTOR_API_KEY,
      baseURL: 'https://spec-chat.tech', // Custom base URL
      timeout: 60000, // 1 minute timeout
      maxRetries: 1,  // Single retry
    });

    const customResponse = await customClient.chat.create({
      model: 'spec-3-turbo',
      messages: [
        { role: 'user', content: 'Test with custom configuration' }
      ],
    }, {
      // Per-request options
      timeout: 15000,  // Override to 15 seconds
      maxRetries: 0,   // No retries for this request
    });

    console.log('Custom configuration test successful');
    console.log(`   Response length: ${customResponse.choices[0].message.content.length} chars\n`);

    // 12. Streaming with Response Access
    console.log(' 12. Advanced Streaming');
    console.log('─'.repeat(50));
    console.log('Question: Explain the benefits of TypeScript');
    console.log('Streaming with response access: ');
    
    const { data: streamData, response: streamResponse } = await client.chat.createStreamWithResponse({
      model: 'spec-3-turbo',
      messages: [
        { role: 'user', content: 'Explain the benefits of TypeScript in 3 points' }
      ],
      stream: true,
    });

    console.log(`[Status: ${streamResponse.status}] `);
    for await (const event of streamData) {
      if (event.choices?.[0]?.delta?.content) {
        process.stdout.write(event.choices[0].delta.content);
      }
    }
    console.log('\n');

    console.log('✨ All examples completed successfully!');
    console.log('\nSummary of demonstrated features:');
    console.log('   Basic chat completions');
    console.log('   Multi-turn conversations');
    console.log('   Streaming responses');
    console.log('   Model listing');
    console.log('   File uploads (multiple methods)');
    console.log('   RAG with individual files');
    console.log('   Multi-file RAG');
    console.log('   Error handling');
    console.log('   Raw response access');
    console.log('   Generic HTTP methods');
    console.log('   Custom configuration');
    console.log('   Advanced streaming');

  } catch (error) {
    console.error('\nExample failed with error:');
    
    if (error instanceof AuthenticationError) {
      console.error('Authentication Error: Invalid API key');
      console.error('Please check your SVECTOR_API_KEY environment variable');
    } else if (error instanceof RateLimitError) {
      console.error('Rate Limit Error: Too many requests');
      console.error('Please wait before making more requests');
    } else if (error instanceof APIError) {
      console.error(`API Error: ${error.message}`);
      console.error(`Status: ${error.status}`);
      console.error(`Request ID: ${error.request_id}`);
    } else {
      console.error('Unexpected Error:', error);
    }
    
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  if (!process.env.SVECTOR_API_KEY) {
    console.error('Please set the SVECTOR_API_KEY environment variable');
    console.error('   export SVECTOR_API_KEY="your-api-key-here"');
    process.exit(1);
  }

  comprehensiveExample().catch(console.error);
}

export { comprehensiveExample };
