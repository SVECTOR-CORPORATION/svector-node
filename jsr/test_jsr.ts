#!/usr/bin/env -S deno run --allow-env --allow-net

/**
 * Test the published JSR package
 */

import { SVECTOR } from "jsr:@svector/svector@1.1.1";

async function testJSRPackage() {
  console.log("🧪 Testing SVECTOR JSR Package");
  console.log("=".repeat(50));
  
  try {
    // Test package import
    console.log("✅ Package imported successfully from JSR!");
    console.log(`📦 SVECTOR class available: ${typeof SVECTOR === 'function'}`);
    
    // Test client creation (will fail without API key, but should not throw on creation)
    if ((globalThis as any).Deno?.env?.get("SVECTOR_API_KEY")) {
      const client = new SVECTOR({
        apiKey: (globalThis as any).Deno.env.get("SVECTOR_API_KEY"),
      });
      
      console.log("✅ Client created successfully!");
      console.log(`🔧 Chat API: ${!!client.chat}`);
      console.log(`🎯 Conversations API: ${!!client.conversations}`);
      console.log(`📁 Files API: ${!!client.files}`);
      console.log(`📚 Models API: ${!!client.models}`);
      console.log(`🧠 Knowledge API: ${!!client.knowledge}`);
      
      // Test a simple conversation
      const response = await client.conversations.create({
        model: "spec-3-turbo:latest",
        instructions: "You are helpful. Keep responses very short.",
        input: "Say hello in exactly 2 words.",
        max_tokens: 10,
      });
      
      console.log(`✅ API call successful: ${response.output}`);
      
    } else {
      console.log("⚠️  No SVECTOR_API_KEY provided, skipping API tests");
      console.log("💡 Set SVECTOR_API_KEY to test actual API calls");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
  
  console.log("\n🎉 JSR Package Test Complete!");
  console.log("📦 Package: jsr:@svector/svector@1.1.1");
  console.log("🌐 JSR URL: https://jsr.io/@svector/svector@1.1.1");
}

// Use a different method to check if this is the main module
if (typeof (globalThis as any).Deno !== 'undefined') {
  await testJSRPackage();
}
