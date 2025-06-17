// SVECTOR SDK - Main exports
export { SVECTOR } from './client';

// Re-export all types
export * from './types';

// Re-export all errors
export * from './errors';

// Re-export utilities
export { toFile } from './utils';

// Re-export API classes for advanced usage
export { ChatCompletions } from './api/chat';
export { Files } from './api/files';
export { Knowledge } from './api/knowledge';
export { Models } from './api/models';

// Default export
export { SVECTOR as default } from './client';
