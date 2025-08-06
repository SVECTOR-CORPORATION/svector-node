/**
 * @file SVECTOR TypeScript/JavaScript SDK
 * @description Official TypeScript/JavaScript SDK for SVECTOR AI Models
 * @version 1.6.3
 * @author SVECTOR Team <support@svector.co.in>
 * @license MIT
 */

// Main client
export { SVECTOR } from './client.ts';

// API classes
export { ChatCompletions } from './api/chat.ts';
export { Conversations } from './api/conversations.ts';
export { Files } from './api/files.ts';
export { Knowledge } from './api/knowledge.ts';
export { Models } from './api/models.ts';
export { Vision } from './api/vision.ts';


// Types
export type * from './types.ts';

// Errors
export * from './errors.ts';

// Utilities
export { toFile } from './utils.ts';

// Default export
export { SVECTOR as default } from './client.ts';
