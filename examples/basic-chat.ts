/**
 * Basic chat completion example
 */
import { SVECTOR } from '../src';

async function basicChat() {
  const client = new SVECTOR({
    apiKey: process.env.SVECTOR_API_KEY,
  });

  try {
    const response = await client.chat.create({
      model: 'spec-3-turbo:latest',
      messages: [
        { role: 'user', content: 'Why is the sky blue?' }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    console.log('Response:', response.choices[0].message.content);
    console.log('Request ID:', response._request_id);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  basicChat();
}
