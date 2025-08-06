import fs from 'fs';
import { SVECTOR } from '../src/index';

/**
 * Comprehensive examples for SVECTOR Vision API
 * Demonstrates various ways to analyze images using the SDK
 */

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});

/**
 * Example 1: Analyze image from URL
 */
async function analyzeImageFromUrl() {
  console.log('🔍 Analyzing image from URL...');
  
  try {
    const result = await client.vision.analyzeFromUrl(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
      'What do you see in this image? Describe the scene in detail.',
      {
        model: 'spec-3-turbo',
        max_tokens: 500,
        detail: 'high'
      }
    );
    
    console.log('Analysis:', result.analysis);
    console.log('Tokens used:', result.usage?.total_tokens);
  } catch (error) {
    console.error('Error analyzing image from URL:', error);
  }
}

/**
 * Example 2: Analyze image from local file (Node.js)
 */
async function analyzeImageFromFile() {
  console.log('📁 Analyzing image from local file...');
  
  try {
    const imageBuffer = fs.readFileSync('./sample-image.jpg');
    const base64Image = imageBuffer.toString('base64');
    
    const result = await client.vision.analyzeFromBase64(
      base64Image,
      'Identify all objects and people in this image. Also describe the setting and mood.',
      {
        model: 'spec-3-turbo',
        max_tokens: 1000,
        temperature: 0.3,
        detail: 'high'
      }
    );
    
    console.log('Analysis:', result.analysis);
  } catch (error) {
    console.error('Error analyzing image from file:', error);
  }
}

/**
 * Example 3: Extract text from image (OCR)
 */
async function extractTextFromImage() {
  console.log('📄 Extracting text from image...');
  
  try {
    const result = await client.vision.extractText({
      image_url: 'https://example.com/document-image.png',
      model: 'spec-3-turbo',
      max_tokens: 1000
    });
    
    console.log('Extracted text:', result.analysis);
  } catch (error) {
    console.error('Error extracting text:', error);
  }
}

/**
 * Example 4: Describe image for accessibility
 */
async function describeForAccessibility() {
  console.log('♿ Creating accessibility description...');
  
  try {
    const result = await client.vision.describeForAccessibility({
      image_url: 'https://example.com/complex-chart.png',
      model: 'spec-3-turbo'
    });
    
    console.log('Accessibility description:', result.analysis);
  } catch (error) {
    console.error('Error creating accessibility description:', error);
  }
}

/**
 * Example 5: Detect specific objects
 */
async function detectSpecificObjects() {
  console.log('🎯 Detecting specific objects...');
  
  try {
    const result = await client.vision.detectObjects(
      {
        image_url: 'https://example.com/street-scene.jpg',
        model: 'spec-3-turbo'
      },
      ['cars', 'people', 'buildings', 'traffic signs']
    );
    
    console.log('Object detection:', result.analysis);
  } catch (error) {
    console.error('Error detecting objects:', error);
  }
}

/**
 * Example 6: Compare multiple images
 */
async function compareImages() {
  console.log('🔄 Comparing multiple images...');
  
  try {
    const result = await client.vision.compareImages([
      { url: 'https://example.com/before.jpg' },
      { url: 'https://example.com/after.jpg' }
    ], 'Compare these before and after images. What changes do you notice?', {
      model: 'spec-3-turbo',
      max_tokens: 800
    });
    
    console.log('Comparison:', result.analysis);
  } catch (error) {
    console.error('Error comparing images:', error);
  }
}

/**
 * Example 7: Upload file and analyze with file ID
 */
async function analyzeUploadedFile() {
  console.log('📤 Uploading and analyzing file...');
  
  try {
    // First upload the file
    const fileResponse = await client.files.create(
      fs.readFileSync('./chart.png'),
      'default',
      'chart.png'
    );
    
    console.log(`File uploaded with ID: ${fileResponse.file_id}`);
    
    // Then analyze using file ID
    const result = await client.vision.analyzeFromFileId(
      fileResponse.file_id,
      'Analyze this chart. What insights can you extract from the data visualization?',
      {
        model: 'spec-3-turbo',
        max_tokens: 800
      }
    );
    
    console.log('Chart analysis:', result.analysis);
  } catch (error) {
    console.error('Error with file upload and analysis:', error);
  }
}

/**
 * Example 8: Using Conversations API with vision
 */
async function conversationWithVision() {
  console.log('💬 Starting conversation with vision...');
  
  try {
    const result = await client.conversations.create({
      model: 'spec-3-turbo',
      instructions: 'You are a helpful assistant that can analyze images and answer questions about them.',
      input: [
        {
          type: 'text',
          text: 'What architectural style is shown in this building?'
        },
        {
          type: 'image_url',
          image_url: {
            url: 'https://example.com/building.jpg',
            detail: 'high'
          }
        }
      ],
      max_tokens: 500
    });
    
    console.log('Architectural analysis:', result.output);
  } catch (error) {
    console.error('Error in vision conversation:', error);
  }
}

/**
 * Example 9: Batch image analysis
 */
async function batchImageAnalysis() {
  console.log('📊 Analyzing multiple images in batch...');
  
  const imageUrls = [
    'https://example.com/product1.jpg',
    'https://example.com/product2.jpg',
    'https://example.com/product3.jpg'
  ];
  
  const analyses = [];
  
  for (const [index, url] of imageUrls.entries()) {
    try {
      console.log(`Analyzing image ${index + 1}/${imageUrls.length}...`);
      
      const result = await client.vision.analyzeFromUrl(
        url,
        'Describe this product. What are its key features and target audience?',
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
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error analyzing image ${index + 1}:`, error);
    }
  }
  
  console.log('Batch analysis results:', analyses);
}

/**
 * Example 10: Real-time image analysis with streaming
 */
async function streamingImageAnalysis() {
  console.log('🌊 Streaming image analysis...');
  
  try {
    // Note: This uses the regular streaming, vision-specific streaming would need separate implementation
    const stream = await client.conversations.createStream({
      model: 'spec-3-turbo',
      instructions: 'You are an expert image analyst. Provide detailed, technical analysis.',
      input: [
        {
          type: 'text',
          text: 'Provide a comprehensive technical analysis of this image, including composition, lighting, colors, and any technical aspects.'
        },
        {
          type: 'image_url',
          image_url: {
            url: 'https://example.com/technical-image.jpg',
            detail: 'high'
          }
        }
      ],
      stream: true,
      max_tokens: 1000
    });
    
    console.log('Streaming analysis:');
    for await (const chunk of stream) {
      if (!chunk.done) {
        process.stdout.write(chunk.content);
      }
    }
    console.log('\n✅ Analysis complete');
  } catch (error) {
    console.error('Error in streaming analysis:', error);
  }
}

// Run examples
async function runExamples() {
  console.log('🚀 SVECTOR Vision API Examples');
  console.log('================================\n');
  
  await analyzeImageFromUrl();
  console.log('\n---\n');
  
  await analyzeImageFromFile();
  console.log('\n---\n');
  
  await extractTextFromImage();
  console.log('\n---\n');
  
  await describeForAccessibility();
  console.log('\n---\n');
  
  await detectSpecificObjects();
  console.log('\n---\n');
  
  await compareImages();
  console.log('\n---\n');
  
  await analyzeUploadedFile();
  console.log('\n---\n');
  
  await conversationWithVision();
  console.log('\n---\n');
  
  await batchImageAnalysis();
  console.log('\n---\n');
  
  await streamingImageAnalysis();
}

// Export functions for individual use
export {
    analyzeImageFromFile, analyzeImageFromUrl, analyzeUploadedFile, batchImageAnalysis, compareImages, conversationWithVision, describeForAccessibility,
    detectSpecificObjects, extractTextFromImage, streamingImageAnalysis
};

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}
