/**
 * Basic conversation example using the sophisticated API
 */
import { SVECTOR } from '../src';

async function basicConversation() {
  const client = new SVECTOR({
    apiKey: process.env.SVECTOR_API_KEY,
  });

  try {
    console.log('Creating a basic conversation...\n');

    // Simple conversation with instructions
    const result = await client.conversations.create({
      model: 'spec-3-turbo',
      instructions: 'You are a helpful assistant who explains scientific concepts clearly.',
      input: 'Why is the sky blue?',
      temperature: 0.7,
      max_tokens: 150,
    });

    console.log('AI Response:');
    console.log(result.output);
    console.log('Request ID:', result._request_id);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  basicConversation();
}
