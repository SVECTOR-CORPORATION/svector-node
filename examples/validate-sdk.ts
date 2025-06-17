/**
 * Simple validation script to test SVECTOR SDK functionality
 */
import { APIError, AuthenticationError, SVECTOR, toFile } from '../src';

async function validateSDK() {
  console.log('🧪 SVECTOR SDK Validation Tests\n');

  // Test 1: Constructor validation
  console.log('Test 1: Constructor validation');
  try {
    new SVECTOR({ apiKey: '' });
    console.log('❌ Should have thrown AuthenticationError');
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.log('✅ Properly validates missing API key');
    } else {
      console.log('❌ Unexpected error type:', error instanceof Error ? error.constructor.name : 'Unknown');
    }
  }

  // Test 2: Valid constructor
  console.log('\nTest 2: Valid constructor');
  try {
    const client = new SVECTOR({ 
      apiKey: 'test-key',
      dangerouslyAllowBrowser: true 
    });
    console.log('✅ Client created successfully');
    console.log(`   • Has chat API: ${!!client.chat}`);
    console.log(`   • Has models API: ${!!client.models}`);
    console.log(`   • Has files API: ${!!client.files}`);
    console.log(`   • Has knowledge API: ${!!client.knowledge}`);
  } catch (error) {
    console.log('❌ Failed to create client:', error);
  }

  // Test 3: Type definitions
  console.log('\nTest 3: Type definitions');
  try {
    // This should compile without errors
    const request: import('../src/types').ChatCompletionRequest = {
      model: 'spec-3-turbo:latest',
      messages: [
        { role: 'user', content: 'test' }
      ],
      temperature: 0.7,
      max_tokens: 100,
    };
    console.log('✅ TypeScript types are working correctly');
  } catch (error) {
    console.log('❌ TypeScript type error:', error);
  }

  // Test 4: Utility functions
  console.log('\nTest 4: Utility functions');
  try {
    const file = await toFile('test content', 'test.txt', { type: 'text/plain' });
    console.log('✅ toFile utility works correctly');
    console.log(`   • File name: ${file.name}`);
    console.log(`   • File type: ${file.type}`);
    console.log(`   • File size: ${file.size} bytes`);
  } catch (error) {
    console.log('❌ toFile utility error:', error);
  }

  // Test 5: Error hierarchy
  console.log('\nTest 5: Error hierarchy');
  const errors = [
    new AuthenticationError('test'),
    new APIError('test', 500),
  ];
  
  for (const error of errors) {
    console.log(`✅ ${error.constructor.name} extends Error: ${error instanceof Error}`);
    console.log(`   • Has status: ${error.status !== undefined}`);
    console.log(`   • Message: ${error.message}`);
  }

  // Test 6: API compatibility check (no actual requests)
  console.log('\nTest 6: API method signatures');
  const client = new SVECTOR({ 
    apiKey: 'test-key',
    dangerouslyAllowBrowser: true 
  });

  // Check that all expected methods exist
  const expectedMethods = [
    'chat.create',
    'chat.createStream',
    'models.list',
    'files.create',
    'knowledge.addFile',
    'get',
    'post',
    'put',
    'delete'
  ];

  for (const method of expectedMethods) {
    const parts = method.split('.');
    let obj: any = client;
    for (const part of parts) {
      obj = obj[part];
    }
    
    if (typeof obj === 'function') {
      console.log(`✅ Method ${method} exists and is callable`);
    } else {
      console.log(`❌ Method ${method} is missing or not a function`);
    }
  }

  console.log('\n🎉 Validation complete!');
  
  if (process.env.SVECTOR_API_KEY) {
    console.log('\n🌐 API key detected - you can run live tests:');
    console.log('   npm run build && node dist/examples/basic-chat.js');
    console.log('   npm run build && node dist/examples/advanced-rag.js');
  } else {
    console.log('\n💡 To test with real API calls, set SVECTOR_API_KEY environment variable');
  }
}

// Run validation
if (require.main === module) {
  validateSDK().catch(console.error);
}

export { validateSDK };
