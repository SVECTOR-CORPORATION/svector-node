/**
 * Streaming chat completion example
 */
import { SVECTOR } from '../src';

async function streamingChat() {
  const client = new SVECTOR({
    apiKey: process.env.SVECTOR_API_KEY,
  });

  try {
    console.log('Starting streaming chat...\n');

    const stream = await client.chat.createStream({
      model: 'spec-3-turbo:latest',
      messages: [
        { role: 'system', content: 'You are a creative storyteller who writes engaging short stories.' },
        { role: 'user', content: 'Tell me a short story about a robot learning to paint' }
      ],
      temperature: 0.8,
      stream: true,
    });

    console.log('Response: ');
    for await (const event of stream) {
      if (event.choices?.[0]?.delta?.content) {
        process.stdout.write(event.choices[0].delta.content);
      }
    }
    console.log('\n\nStreaming completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  streamingChat();
}
