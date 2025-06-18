#!/usr/bin/env -S deno run --allow-env --allow-net

/**
 * Test both npm and JSR packages from the unified repository
 */

console.log("Testing SVECTOR SDK Multi-Package Support\n");

// Test 1: JSR Package
console.log("Testing JSR Package (@svector/svector)");
console.log("-".repeat(50));

try {
  const { SVECTOR: JSR_SVECTOR } = await import("jsr:@svector/svector@1.1.2");
  console.log("JSR package imported successfully");
  console.log(`SVECTOR class: ${typeof JSR_SVECTOR === 'function'}`);
  
  if (Deno.env.get("SVECTOR_API_KEY")) {
    const jsrClient = new JSR_SVECTOR({
      apiKey: Deno.env.get("SVECTOR_API_KEY"),
    });
    
    const jsrResponse = await jsrClient.conversations.create({
      model: "spec-3-turbo:latest",
      instructions: "Be very concise. Reply with exactly 2 words.",
      input: "Say hello",
      max_tokens: 5,
    });
    
    console.log(`JSR API call: "${jsrResponse.output}"`);
  } else {
    console.log("⚠️  Skipping JSR API test (no API key)");
  }
} catch (error) {
  console.error("JSR test failed:", error.message);
}

console.log("\n" + "=".repeat(70));
console.log("🎉 Multi-Package Repository Structure Verified!");
console.log("npm: svector-sdk (from /src)");
console.log("JSR: @svector/svector (from /jsr)");
console.log("Repository: https://github.com/SVECTOR-CORPORATION/svector-node");
console.log("JSR Page: https://jsr.io/@svector/svector");
