/**
 * Node.js specific example demonstrating server-side usage
 */
import { SVECTOR } from '../src';

async function nodeJSExample() {
  console.log('🚀 Node.js SVECTOR SDK Example\n');

  // Initialize client (API key from environment variable)
  const client = new SVECTOR({
    apiKey: process.env.SVECTOR_API_KEY,
  });

  try {
    // Example 1: Simple chat
    console.log('📝 Example 1: Simple Chat');
    console.log('─'.repeat(50));
    
    const response = await client.chat.create({
      model: 'spec-3-turbo:latest',
      messages: [
        { role: 'user', content: 'Explain Node.js in one paragraph' }
      ],
      temperature: 0.7,
    });

    console.log('Question: Explain Node.js in one paragraph');
    console.log(`Answer: ${response.choices[0].message.content}\n`);

    // Example 2: Using with Express.js server simulation
    console.log(' Example 2: Express.js Integration Pattern');
    console.log('─'.repeat(50));
    
    async function handleChatRequest(userMessage: string, conversationHistory: any[] = []) {
      try {
        const messages = [
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ];

        const response = await client.chat.create({
          model: 'spec-3-turbo:latest',
          messages,
          max_tokens: 500,
        });

        return {
          success: true,
          message: response.choices[0].message.content,
          requestId: response._request_id,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Simulate API requests
    const result1 = await handleChatRequest('What is serverless computing?');
    console.log('API Response 1:', result1);

    const result2 = await handleChatRequest('Give me an example', [
      { role: 'user', content: 'What is serverless computing?' },
      { role: 'assistant', content: result1.message }
    ]);
    console.log('API Response 2:', result2);

    // Example 3: Batch processing
    console.log('\n Example 3: Batch Processing');
    console.log('─'.repeat(50));
    
    const questions = [
      'What is the capital of France?',
      'How does photosynthesis work?',
      'What is the difference between AI and ML?'
    ];

    const batchResults = await Promise.all(
      questions.map(async (question, index) => {
        try {
          const response = await client.chat.create({
            model: 'spec-3-turbo:latest',
            messages: [{ role: 'user', content: question }],
            max_tokens: 100,
          });
          
          return {
            id: index + 1,
            question,
            answer: response.choices[0].message.content,
            success: true,
          };
        } catch (error) {
          return {
            id: index + 1,
            question,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
          };
        }
      })
    );

    console.log('Batch Results:');
    batchResults.forEach(result => {
      console.log(`${result.id}. ${result.question}`);
      if (result.success) {
        console.log(`   ✅ ${result.answer}`);
      } else {
        console.log(`   ❌ Error: ${result.error}`);
      }
    });

    // Example 4: Environment configuration patterns
    console.log('\n Example 4: Configuration Patterns');
    console.log('─'.repeat(50));
    
    // Development configuration
    const devClient = new SVECTOR({
      apiKey: process.env.SVECTOR_API_KEY,
      timeout: 30000, // Shorter timeout for development
      maxRetries: 1,  // Fewer retries for faster feedback
    });

    // Production configuration
    const prodClient = new SVECTOR({
      apiKey: process.env.SVECTOR_API_KEY,
      timeout: 120000, // Longer timeout for production
      maxRetries: 3,   // More retries for reliability
    });

    console.log('✅ Development client configured');
    console.log('✅ Production client configured');

    // Example 5: Error handling patterns
    console.log('\n Example 5: Error Handling Patterns');
    console.log('─'.repeat(50));
    
    async function robustChatCall(message: string, retries = 3) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await client.chat.create({
            model: 'spec-3-turbo:latest',
            messages: [{ role: 'user', content: message }],
          });
          
          return {
            success: true,
            data: response.choices[0].message.content,
            attempt,
          };
        } catch (error) {
          console.log(`Attempt ${attempt} failed:`, error instanceof Error ? error.message : error);
          
          if (attempt === retries) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              attempts: attempt,
            };
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    const robustResult = await robustChatCall('Test robust error handling');
    console.log('Robust call result:', robustResult);

    console.log('\n✨ Node.js examples completed successfully!');

  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Express.js integration example (commented code for reference)
/*
import express from 'express';

const app = express();
app.use(express.json());

const client = new SVECTOR({
  apiKey: process.env.SVECTOR_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    const response = await client.chat.create({
      model: 'spec-3-turbo:latest',
      messages: [
        ...conversationHistory,
        { role: 'user', content: message }
      ],
    });
    
    res.json({
      success: true,
      message: response.choices[0].message.content,
      requestId: response._request_id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
*/

// Run the example
if (require.main === module) {
  if (!process.env.SVECTOR_API_KEY) {
    console.error('❌ Please set the SVECTOR_API_KEY environment variable');
    process.exit(1);
  }
  
  nodeJSExample().catch(console.error);
}

export { nodeJSExample };
