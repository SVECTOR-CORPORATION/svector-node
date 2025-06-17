/**
 * Basic browser usage example
 * This demonstrates how to use SVECTOR SDK in a browser environment
 */

// Browser example - copy this into an HTML file
const browserExample = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVECTOR SDK Browser Example</title>
    <script src="https://unpkg.com/svector@latest/dist/index.js"></script>
</head>
<body>
    <h1>SVECTOR SDK Browser Example</h1>
    
    <div>
        <label for="apiKey">API Key:</label>
        <input type="password" id="apiKey" placeholder="Enter your SVECTOR API key">
    </div>
    
    <div>
        <label for="message">Message:</label>
        <input type="text" id="message" placeholder="Ask me anything..." value="What is artificial intelligence?">
        <button onclick="sendMessage()">Send</button>
    </div>
    
    <div>
        <h3>Response:</h3>
        <div id="response" style="border: 1px solid #ccc; padding: 10px; min-height: 100px;"></div>
    </div>

    <script>
        async function sendMessage() {
            const apiKey = document.getElementById('apiKey').value;
            const message = document.getElementById('message').value;
            const responseDiv = document.getElementById('response');
            
            if (!apiKey) {
                alert('Please enter your API key');
                return;
            }
            
            responseDiv.textContent = 'Loading...';
            
            try {
                const client = new SVECTOR({
                    apiKey: apiKey,
                    dangerouslyAllowBrowser: true // Required for browser usage
                });
                
                const response = await client.chat.create({
                    model: 'spec-3-turbo:latest',
                    messages: [
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                });
                
                responseDiv.textContent = response.choices[0].message.content;
            } catch (error) {
                responseDiv.textContent = 'Error: ' + error.message;
                console.error('SVECTOR API Error:', error);
            }
        }
        
        // Enable Enter key to send message
        document.getElementById('message').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    </script>
</body>
</html>
`;

console.log("Browser Example HTML:");
console.log(browserExample);

// For npm package users who want to use in browser with bundlers like webpack
export async function browserChatExample() {
    // This would be imported like: import { browserChatExample } from 'svector/examples/browser';
    
    console.log('🌐 Browser Chat Example');
    console.log('WARNING: This exposes your API key to client-side code!');
    
    // In a real browser environment, you'd get the API key from user input
    const apiKey = prompt('Enter your SVECTOR API key:');
    
    if (!apiKey) {
        console.error('API key required');
        return;
    }
    
    try {
        const { SVECTOR } = await import('../src');
        
        const client = new SVECTOR({
            apiKey,
            dangerouslyAllowBrowser: true
        });
        
        const message = prompt('What would you like to ask?') || 'Hello!';
        
        const response = await client.chat.create({
            model: 'spec-3-turbo:latest',
            messages: [
                { role: 'user', content: message }
            ],
        });
        
        console.log('Response:', response.choices[0].message.content);
        alert('Response: ' + response.choices[0].message.content);
        
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert('Error: ' + errorMessage);
    }
}

// Only run if in browser environment
if (typeof window !== 'undefined') {
    console.log('Browser environment detected. You can call browserChatExample() to test.');
}
