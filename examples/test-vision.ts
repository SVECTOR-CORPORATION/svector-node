import { SVECTOR } from '../src/index';

/**
 * Quick test for SVECTOR Vision API
 */

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});

async function testVisionAPI() {
  console.log('🧪 Testing SVECTOR Vision API...');
  
  try {
    // Test basic URL analysis
    console.log('Testing URL analysis...');
    const result = await client.vision.analyzeFromUrl(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
      'What do you see in this image?',
      {
        model: 'spec-3-turbo',
        max_tokens: 200
      }
    );
    
    console.log('✅ Vision API working!');
    console.log('Analysis:', result.analysis);
    console.log('Tokens used:', result.usage?.total_tokens || 'N/A');
    
    // Test advanced response format
    console.log('\nTesting advanced response format...');
    const advancedResult = await client.vision.createResponse({
      model: "spec-3-turbo",
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: "Describe this image briefly" },
          {
            type: "input_image",
            image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
          },
        ],
      }],
      max_tokens: 150
    });
    
    console.log('✅ Advanced format working!');
    console.log('Response:', advancedResult.output_text);
    
  } catch (error) {
    console.error('❌ Vision API test failed:', error);
  }
}

// Run test
testVisionAPI().catch(console.error);
