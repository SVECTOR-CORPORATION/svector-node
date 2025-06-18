#!/usr/bin/env node

/**
 * SVECTOR SDK Setup and Quick Start Guide
 * This script helps users get started with the SVECTOR SDK
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SVECTOR SDK Quick Start Guide\n');

function runCommand(command, description) {
  console.log(`📋 ${description}`);
  try {
    execSync(command, { stdio: 'pipe' });
    console.log('✅ Success\n');
  } catch (error) {
    console.log(`❌ Failed: ${error.message}\n`);
  }
}

function checkEnvironment() {
  console.log('🔍 Checking environment...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`   Node.js version: ${nodeVersion}`);
  
  if (parseInt(nodeVersion.slice(1)) < 18) {
    console.log('⚠️  Warning: Node.js 18+ is recommended');
  } else {
    console.log('✅ Node.js version is compatible');
  }
  
  // Check if TypeScript is available
  try {
    execSync('npx tsc --version', { stdio: 'pipe' });
    console.log('✅ TypeScript is available');
  } catch {
    console.log('ℹ️  TypeScript not found globally (this is OK)');
  }
  
  console.log('');
}

function createExampleProject() {
  console.log('📁 Creating example project...');
  
  const projectDir = 'svector-example';
  const exampleCode = `
import { SVECTOR } from 'svector';

async function main() {
  const client = new SVECTOR({
    apiKey: process.env.SVECTOR_API_KEY,
  });

  try {
    // List available models
    const models = await client.models.list();
    console.log('Available models:', models.models);

    // Basic chat completion
    const response = await client.chat.create({
      model: 'spec-3-turbo:latest',
      messages: [
        { role: 'user', content: 'Hello! How can SVECTOR help developers?' }
      ],
      max_tokens: 150,
    });

    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
`;

  const packageJson = {
    name: 'svector-example',
    version: '1.0.0',
    description: 'Example project using SVECTOR SDK',
    main: 'index.js',
    type: 'module',
    scripts: {
      start: 'node index.js',
      'start:ts': 'npx tsx index.ts'
    },
    dependencies: {
      svector: '^1.0.0'
    },
    devDependencies: {
      'tsx': '^4.0.0',
      'typescript': '^5.0.0'
    }
  };

  try {
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir);
    }
    
    fs.writeFileSync(
      path.join(projectDir, 'index.ts'),
      exampleCode.trim()
    );
    
    fs.writeFileSync(
      path.join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    fs.writeFileSync(
      path.join(projectDir, '.env.example'),
      'SVECTOR_API_KEY=your-api-key-here\n'
    );
    
    console.log(`✅ Example project created in ${projectDir}/`);
    console.log('');
  } catch (error) {
    console.log(`❌ Failed to create example project: ${error.message}\n`);
  }
}

function showQuickStart() {
  console.log('🚀 Quick Start Guide');
  console.log('─'.repeat(50));
  console.log('');
  
  console.log('1️⃣  Install SVECTOR SDK:');
  console.log('   npm install svector');
  console.log('');
  
  console.log('2️⃣  Get your API key:');
  console.log('   Visit: https://platform.svector.co.in');
  console.log('   Generate an API key from your dashboard');
  console.log('');
  
  console.log('3️⃣  Set environment variable:');
  console.log('   export SVECTOR_API_KEY="your-api-key-here"');
  console.log('');
  
  console.log('4️⃣  Basic usage:');
  console.log(`
   import { SVECTOR } from 'svector';
   
   const client = new SVECTOR();
   
   const response = await client.chat.create({
     model: 'spec-3-turbo:latest',
     messages: [{ role: 'user', content: 'Hello!' }],
   });
   
   console.log(response.choices[0].message.content);
  `);
}

function showAvailableExamples() {
  console.log('📚 Available Examples');
  console.log('─'.repeat(50));
  console.log('');
  
  const examples = [
    'basic-chat.ts - Simple chat completion',
    'streaming-chat.ts - Real-time streaming responses',
    'file-upload-rag.ts - File upload and RAG usage',
    'advanced-rag.ts - Advanced RAG with multiple files',
    'nodejs-example.ts - Node.js integration patterns',
    'browser-example.ts - Browser usage examples',
    'comprehensive-demo.ts - Complete feature showcase'
  ];
  
  examples.forEach((example, index) => {
    console.log(`   ${index + 1}. ${example}`);
  });
  
  console.log('');
  console.log('💡 Find all examples at: https://github.com/svector-corporation/svector-sdk/tree/main/examples');
}

function showDocumentation() {
  console.log('📖 Documentation');
  console.log('─'.repeat(50));
  console.log('');
  
  console.log('📋 API Reference: https://platform.svector.co.in');
  console.log('🌐 Website: https://www.svector.co.in');
  console.log('📧 Support: support@svector.co.in');
  console.log('🐛 Issues: https://github.com/svector-corporation/svector-sdk/issues');
  console.log('');
}

function showTroubleshooting() {
  console.log('🛠️  Troubleshooting');
  console.log('─'.repeat(50));
  console.log('');
  
  console.log('❓ Common Issues:');
  console.log('');
  console.log('🔑 Authentication Error:');
  console.log('   • Check your API key is correct');
  console.log('   • Ensure SVECTOR_API_KEY environment variable is set');
  console.log('   • Verify your API key has necessary permissions');
  console.log('');
  
  console.log('🌐 Network Errors:');
  console.log('   • Check internet connectivity');
  console.log('   • Verify firewall/proxy settings');
  console.log('   • Try increasing timeout: { timeout: 60000 }');
  console.log('');
  
  console.log('📱 Browser Issues:');
  console.log('   • Set dangerouslyAllowBrowser: true');
  console.log('   • Use environment variables for API keys in development only');
  console.log('   • Consider using a backend proxy for production');
  console.log('');
  
  console.log('🔄 Rate Limiting:');
  console.log('   • Built-in retry logic handles most cases');
  console.log('   • Implement exponential backoff for high-volume usage');
  console.log('   • Monitor your usage limits in the dashboard');
  console.log('');
}

// Main execution
async function main() {
  checkEnvironment();
  showQuickStart();
  showAvailableExamples();
  showDocumentation();
  showTroubleshooting();
  
  // Optionally create example project
  console.log('🎯 Want to create an example project? (y/n)');
  
  // In a real CLI tool, you'd use readline here
  // For this example, we'll just show the option
  console.log('   Run: node setup.js --create-example');
  console.log('');
  
  console.log('✨ You\'re ready to start building with SVECTOR!');
  console.log('');
  console.log('Happy coding! 🚀');
}

// Handle command line arguments
if (process.argv.includes('--create-example')) {
  createExampleProject();
} else {
  main();
}

module.exports = {
  checkEnvironment,
  createExampleProject,
  showQuickStart,
  showAvailableExamples,
  showDocumentation,
  showTroubleshooting
};
