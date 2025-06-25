#!/usr/bin/env -S deno run --allow-env --allow-net

/**
 * Streaming conversation example for Deno
 */

import { SVECTOR } from "../mod.ts";

async function streamingExample() {
  console.log(" SVECTOR Streaming Example\n");
  
  const client = new SVECTOR({
    apiKey: Deno.env.get("SVECTOR_API_KEY"),
  });

  try {
    console.log("Question: Tell me a short story about TypeScript");
    console.log("Streaming Response: ");
    
    const stream = await client.conversations.createStream({
      model: "spec-3-turbo",
      instructions: "You are a creative storyteller. Keep stories concise and engaging.",
      input: "Tell me a short story about TypeScript",
      temperature: 0.8,
      max_tokens: 300,
      stream: true,
    });

    for await (const event of stream) {
      if (!event.done && event.content) {
        // Write content without newlines to show streaming effect
        await Deno.stdout.write(new TextEncoder().encode(event.content));
      } else if (event.done) {
        console.log("\n\nStreaming completed!");
        break;
      }
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

if (import.meta.main) {
  if (!Deno.env.get("SVECTOR_API_KEY")) {
    console.error("Please set SVECTOR_API_KEY environment variable");
    Deno.exit(1);
  }
  
  await streamingExample();
}
