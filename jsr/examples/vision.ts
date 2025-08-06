#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read

/**
 * SVECTOR Vision API Examples for Deno
 * Demonstrates vision capabilities using JSR package
 */

import { SVECTOR } from "../mod.ts";

const client = new SVECTOR({
  apiKey: Deno.env.get("SVECTOR_API_KEY"),
});

/**
 * Example 1: Analyze image from URL
 */
async function analyzeImageFromUrl() {
  console.log('🔍 Analyzing image from URL...');
  
  try {
    const result = await client.vision.analyzeFromUrl(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
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
 * Example 2: Analyze image from local file (Deno)
 */
async function analyzeImageFromFile() {
  console.log('📁 Analyzing image from local file...');
  
  try {
    // Check if sample image exists
    try {
      await Deno.stat('./sample-image.jpg');
    } catch {
      console.log('Sample image not found, skipping file analysis');
      return;
    }

    const imageData = await Deno.readFile('./sample-image.jpg');
    const base64Image = btoa(String.fromCharCode(...imageData));
    
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
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lenna_%28test_image%29.png/256px-Lenna_%28test_image%29.png',
      model: 'spec-3-turbo',
      max_tokens: 1000
    });
    
    console.log('Extracted text:', result.analysis);
  } catch (error) {
    console.error('Error extracting text:', error);
  }
}

/**
 * Example 4: Advanced response format
 */
async function advancedResponseFormat() {
  console.log('🚀 Using advanced response format...');
  
  try {
    const response = await client.vision.createResponse({
      model: "spec-3-turbo",
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: "What's in this image? Be detailed." },
          {
            type: "input_image",
            image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
          },
        ],
      }],
      max_tokens: 500
    });

    console.log('Advanced analysis:', response.output_text);
  } catch (error) {
    console.error('Error with advanced format:', error);
  }
}

/**
 * Example 5: Object detection
 */
async function detectObjects() {
  console.log('🎯 Detecting specific objects...');
  
  try {
    const result = await client.vision.detectObjects(
      {
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
        model: 'spec-3-turbo'
      },
      ['trees', 'path', 'sky', 'grass', 'boardwalk']
    );
    
    console.log('Object detection:', result.analysis);
  } catch (error) {
    console.error('Error detecting objects:', error);
  }
}

/**
 * Example 6: Batch processing with built-in method
 */
async function batchProcessing() {
  console.log('📊 Batch processing multiple images...');
  
  try {
    const images = [
      {
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
        prompt: 'Describe this nature scene'
      },
      {
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lenna_%28test_image%29.png/256px-Lenna_%28test_image%29.png',
        prompt: 'What do you see in this portrait?'
      }
    ];

    const results = await client.vision.batchAnalyze(images, {
      model: 'spec-3-turbo',
      max_tokens: 300,
      delay: 1000 // 1 second delay between requests
    });

    results.forEach((result, index) => {
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
 * Example 7: File upload and analysis
 */
async function uploadAndAnalyze() {
  console.log('📤 Uploading file and analyzing...');
  
  try {
    // Check if sample image exists
    try {
      await Deno.stat('./sample-image.jpg');
    } catch {
      console.log('Sample image not found, skipping upload analysis');
      return;
    }

    // First upload the file
    const imageData = await Deno.readFile('./sample-image.jpg');
    const fileResponse = await client.files.create(
      imageData,
      'default',
      'sample-image.jpg'
    );
    
    console.log(`File uploaded with ID: ${fileResponse.file_id}`);
    
    // Then analyze using file ID
    const result = await client.vision.analyzeFromFileId(
      fileResponse.file_id,
      'Analyze this image comprehensively. What story does it tell?',
      {
        model: 'spec-3-turbo',
        max_tokens: 800
      }
    );
    
    console.log('File analysis:', result.analysis);
  } catch (error) {
    console.error('Error with file upload and analysis:', error);
  }
}

/**
 * Example 8: Caption generation
 */
async function generateCaptions() {
  console.log('📱 Generating social media captions...');
  
  try {
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg';

    // Professional caption
    const professional = await client.vision.generateCaption({
      image_url: imageUrl
    }, 'professional');

    // Casual caption
    const casual = await client.vision.generateCaption({
      image_url: imageUrl
    }, 'casual');

    console.log('Professional:', professional.analysis);
    console.log('Casual:', casual.analysis);
  } catch (error) {
    console.error('Error generating captions:', error);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 SVECTOR Vision API Examples for Deno');
  console.log('=====================================\n');

  if (!Deno.env.get("SVECTOR_API_KEY")) {
    console.error('❌ SVECTOR_API_KEY environment variable is required');
    console.log('Set it with: export SVECTOR_API_KEY="your-api-key"');
    Deno.exit(1);
  }

  await analyzeImageFromUrl();
  console.log('\n---\n');

  await analyzeImageFromFile();
  console.log('\n---\n');

  await extractTextFromImage();
  console.log('\n---\n');

  await advancedResponseFormat();
  console.log('\n---\n');

  await detectObjects();
  console.log('\n---\n');

  await batchProcessing();
  console.log('\n---\n');

  await uploadAndAnalyze();
  console.log('\n---\n');

  await generateCaptions();
  
  console.log('\n✅ All vision examples completed!');
}

// Export functions for individual use
export {
    advancedResponseFormat, analyzeImageFromFile, analyzeImageFromUrl, batchProcessing, detectObjects, extractTextFromImage, generateCaptions, uploadAndAnalyze
};

// Run if called directly
if (import.meta.main) {
  runAllExamples().catch(console.error);
}
