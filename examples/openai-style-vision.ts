import fs from 'fs';
import { SVECTOR } from '../src/index';

/**
 * OpenAI-style Vision API Examples
 * Demonstrates compatibility with OpenAI's vision API patterns
 */

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});

/**
 * Example 1: OpenAI-style responses.create with image URL
 */
async function openAIStyleURL() {
  console.log('🔗 OpenAI-style URL analysis...');
  
  try {
    const response = await client.vision.createResponse({
      model: "spec-3-turbo",
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: "what's in this image?" },
          {
            type: "input_image",
            image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
          },
        ],
      }],
    });

    console.log('Analysis:', response.output_text);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 2: OpenAI-style with base64 image
 */
async function openAIStyleBase64() {
  console.log('📁 OpenAI-style base64 analysis...');
  
  try {
    const imagePath = "./sample-image.jpg";
    const base64Image = fs.readFileSync(imagePath, "base64");

    const response = await client.vision.createResponse({
      model: "spec-3-turbo",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "what's in this image?" },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${base64Image}`,
            },
          ],
        },
      ],
    });

    console.log('Analysis:', response.output_text);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 3: OpenAI-style with file ID
 */
async function openAIStyleFileID() {
  console.log('📤 OpenAI-style file ID analysis...');
  
  try {
    // Upload file first
    const fileContent = fs.createReadStream("./sample-image.jpg");
    const fileResult = await client.files.create(fileContent, "default");
    const fileId = fileResult.file_id;

    const response = await client.vision.createResponse({
      model: "spec-3-turbo",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "what's in this image?" },
            {
              type: "input_image",
              file_id: fileId,
            },
          ],
        },
      ],
    });

    console.log('File ID:', fileId);
    console.log('Analysis:', response.output_text);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 4: Batch processing with enhanced features
 */
async function batchImageProcessing() {
  console.log('📊 Batch image processing...');
  
  try {
    const images = [
      {
        image_url: 'https://example.com/product1.jpg',
        prompt: 'Describe this product and its key features'
      },
      {
        image_url: 'https://example.com/product2.jpg',
        prompt: 'What is the main selling point of this product?'
      },
      {
        image_url: 'https://example.com/product3.jpg',
        prompt: 'Who is the target audience for this product?'
      }
    ];

    const results = await client.vision.batchAnalyze(images, {
      model: 'spec-3-turbo',
      max_tokens: 300,
      delay: 1500 // 1.5 second delay between requests
    });

    results.forEach((result: { analysis: string; usage?: any; error?: string }, index: number) => {
      if (result.error) {
        console.log(`Image ${index + 1}: Error - ${result.error}`);
      } else {
        console.log(`Image ${index + 1}: ${result.analysis}`);
        console.log(`Tokens used: ${result.usage?.total_tokens || 'N/A'}`);
      }
      console.log('---');
    });
  } catch (error) {
    console.error('Error in batch processing:', error);
  }
}

/**
 * Example 5: Confidence scoring
 */
async function confidenceScoring() {
  console.log('🎯 Image analysis with confidence scoring...');
  
  try {
    const result = await client.vision.analyzeWithConfidence({
      image_url: 'https://example.com/medical-scan.jpg',
      prompt: 'Analyze this medical image and identify any abnormalities',
      model: 'spec-3-turbo'
    });

    console.log('Analysis:', result.analysis);
    console.log('Confidence:', result.confidence ? `${result.confidence}%` : 'Not provided');
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 6: Social media caption generation
 */
async function socialMediaCaptions() {
  console.log('📱 Social media caption generation...');
  
  try {
    const imageUrl = 'https://example.com/vacation-photo.jpg';

    // Professional caption
    const professional = await client.vision.generateCaption({
      image_url: imageUrl
    }, 'professional');

    // Casual caption
    const casual = await client.vision.generateCaption({
      image_url: imageUrl
    }, 'casual');

    // Funny caption
    const funny = await client.vision.generateCaption({
      image_url: imageUrl
    }, 'funny');

    console.log('Professional:', professional.analysis);
    console.log('Casual:', casual.analysis);
    console.log('Funny:', funny.analysis);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 7: Advanced vision with streaming
 */
async function streamingVisionAnalysis() {
  console.log('🌊 Streaming vision analysis...');
  
  try {
    const stream = await client.conversations.createStream({
      model: 'spec-3-turbo',
      instructions: 'You are an expert art critic and historian. Provide detailed analysis.',
      input: 'Analyze this artwork in detail, including style, composition, historical context, and artistic techniques.',
      // Note: For full image + text streaming, use chat.createStream with proper message format
      stream: true,
      max_tokens: 1500
    });

    console.log('Art analysis: ');
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

/**
 * Example 8: Technical image analysis
 */
async function technicalAnalysis() {
  console.log('🔬 Technical image analysis...');
  
  try {
    const result = await client.vision.analyzeFromUrl(
      'https://example.com/circuit-board.jpg',
      'Provide a technical analysis of this electronic circuit board. Identify components, trace paths, and assess the overall design.',
      {
        model: 'spec-3-turbo',
        max_tokens: 1200,
        temperature: 0.1, // Low temperature for technical accuracy
        detail: 'high'
      }
    );

    console.log('Technical analysis:', result.analysis);
    console.log('Token usage:', result.usage);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 9: Multi-modal conversation
 */
async function multiModalConversation() {
  console.log('💬 Multi-modal conversation...');
  
  try {
    // Start with image analysis
    const initialAnalysis = await client.conversations.create({
      model: 'spec-3-turbo',
      instructions: 'You are a helpful assistant that can analyze images and maintain conversation context.',
      input: 'What do you see in this image?',
      // Note: For full multi-modal support with conversations, consider using chat.create instead
    });

    console.log('Initial analysis:', initialAnalysis.output);

    // Follow up with a text-only question
    const followUp = await client.conversations.create({
      model: 'spec-3-turbo',
      instructions: 'You are a helpful assistant. Remember the previous image analysis.',
      input: 'Based on what you saw in that image, what time of day do you think it was taken?',
      context: [
        'What do you see in this image?',
        initialAnalysis.output
      ]
    });

    console.log('Follow-up response:', followUp.output);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 SVECTOR OpenAI-Style Vision API Examples');
  console.log('=============================================\n');

  await openAIStyleURL();
  console.log('\n---\n');

  await openAIStyleBase64();
  console.log('\n---\n');

  await openAIStyleFileID();
  console.log('\n---\n');

  await batchImageProcessing();
  console.log('\n---\n');

  await confidenceScoring();
  console.log('\n---\n');

  await socialMediaCaptions();
  console.log('\n---\n');

  await streamingVisionAnalysis();
  console.log('\n---\n');

  await technicalAnalysis();
  console.log('\n---\n');

  await multiModalConversation();
}

// Export functions for individual use
export {
    batchImageProcessing,
    confidenceScoring, multiModalConversation, openAIStyleBase64,
    openAIStyleFileID, openAIStyleURL, socialMediaCaptions,
    streamingVisionAnalysis,
    technicalAnalysis
};

// Run if called directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
