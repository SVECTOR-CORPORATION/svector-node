#!/usr/bin/env -S deno run --allow-env --allow-net

/**
 * Basic conversation example for Deno
 */

import { SVECTOR } from "../mod.ts";

async function basicExample() {
  console.log("SVECTOR Deno Example\n");
  
  const client = new SVECTOR({
    apiKey: Deno.env.get("SVECTOR_API_KEY"),
  });

  try {
    // Simple conversation
    const response = await client.conversations.create({
      model: "spec-3-turbo:latest",
      instructions: "You are a helpful AI assistant that explains things clearly.",
      input: "What is the difference between Deno and Node.js?",
      temperature: 0.7,
      max_tokens: 200,
    });

    console.log("AI Response:");
    console.log(response.output);
    console.log(`\nRequest ID: ${response._request_id}`);
    console.log(`Usage: ${JSON.stringify(response.usage, null, 2)}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

if (import.meta.main) {
  if (!Deno.env.get("SVECTOR_API_KEY")) {
    console.error("Please set SVECTOR_API_KEY environment variable");
    Deno.exit(1);
  }
  
  await basicExample();
}
