/**
 * File upload and RAG example
 */
import fs from 'fs';
import path from 'path';
import { SVECTOR } from '../src';

async function fileUploadExample() {
  const client = new SVECTOR({
    apiKey: process.env.SVECTOR_API_KEY,
  });

  try {
    // Create a sample text file for demonstration
    const sampleContent = `
SVECTOR Corporation Overview

SVECTOR is a leading AI and machine learning company that provides advanced 
language models and AI solutions. Our flagship product, Spec-Chat, offers 
state-of-the-art conversational AI capabilities with support for:

- Advanced natural language understanding
- Retrieval Augmented Generation (RAG)
- Multi-modal processing
- Enterprise-grade security and scalability

Founded in 2023, SVECTOR has quickly become a trusted partner for businesses
looking to integrate AI into their workflows and applications.
    `;

    const tempFile = path.join(__dirname, 'sample-document.txt');
    fs.writeFileSync(tempFile, sampleContent);

    console.log('Uploading file...');
    
    // Upload the file
    const fileResponse = await client.files.create(
      fs.createReadStream(tempFile),
      'default'
    );

    console.log(`File uploaded successfully! File ID: ${fileResponse.file_id}`);

    // Now use the file in a chat completion
    console.log('\nAsking question about the uploaded document...');
    
    const chatResponse = await client.chat.create({
      model: 'spec-3-turbo',
      messages: [
        { role: 'user', content: 'What is SVECTOR Corporation and what products do they offer?' }
      ],
      files: [
        { type: 'file', id: fileResponse.file_id }
      ],
    });

    console.log('\nResponse from document:', chatResponse.choices[0].message.content);

    // Clean up
    fs.unlinkSync(tempFile);
    console.log('\nCleanup completed!');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  fileUploadExample();
}
