// SVECTOR SDK - Main exports
export { SVECTOR } from './client.ts';

// Re-export all types
export * from './types.ts';

// Re-export all errors
export * from './errors.ts';

// Re-export utilities
export { toFile } from './utils.ts';

// Re-export API classes for advanced usage
export { ChatCompletions } from './api/chat';
export { Conversations } from './api/conversations';
export { Files } from './api/files';
export { Knowledge } from './api/knowledge';
export { Models } from './api/models';

// Default export
export { SVECTOR as default } from './client.ts';
