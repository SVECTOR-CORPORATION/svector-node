/**
 * Utility function to create a File-like object from various inputs
 * This is useful for file uploads across different environments
 */
export async function toFile(
  value: any,
  filename?: string,
  options?: { type?: string }
): Promise<File> {
  // If it's already a File, return as is
  if (value instanceof File) {
    return value;
  }

  // Handle Buffer (Node.js)
  if (typeof Buffer !== 'undefined' && value instanceof Buffer) {
    const blob = new Blob([value], { type: options?.type || 'application/octet-stream' });
    return new File([blob], filename || 'file', { type: blob.type });
  }

  // Handle Uint8Array
  if (value instanceof Uint8Array) {
    const blob = new Blob([value], { type: options?.type || 'application/octet-stream' });
    return new File([blob], filename || 'file', { type: blob.type });
  }

  // Handle string
  if (typeof value === 'string') {
    const blob = new Blob([value], { type: options?.type || 'text/plain' });
    return new File([blob], filename || 'file.txt', { type: blob.type });
  }

  // Handle ReadableStream
  if (value && typeof value.getReader === 'function') {
    const chunks: BlobPart[] = [];
    const reader = value.getReader();
    
    try {
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        chunks.push(chunk);
      }
    } finally {
      reader.releaseLock();
    }

    const blob = new Blob(chunks, { type: options?.type || 'application/octet-stream' });
    return new File([blob], filename || 'file', { type: blob.type });
  }

  // If it's a Response object
  if (value && typeof value.arrayBuffer === 'function') {
    const arrayBuffer = await value.arrayBuffer();
    const blob = new Blob([arrayBuffer], { 
      type: options?.type || value.headers?.get('content-type') || 'application/octet-stream' 
    });
    return new File([blob], filename || 'file', { type: blob.type });
  }

  throw new Error('Unsupported input type for toFile()');
}

/**
 * Check if running in Node.js environment
 */
export function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

/**
 * Check if running in browser environment
 */
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Get the appropriate fetch implementation for the current environment
 */
export function getDefaultFetch(): typeof fetch {
  if (typeof globalThis !== 'undefined' && globalThis.fetch) {
    return globalThis.fetch;
  }
  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch;
  }
  if (typeof global !== 'undefined' && (global as any).fetch) {
    return (global as any).fetch;
  }
  
  // Try to use node-fetch if available in Node.js
  if (isNodeEnvironment()) {
    try {
      const nodeFetch = require('node-fetch');
      return nodeFetch.default || nodeFetch;
    } catch {
      // node-fetch not available
    }
  }
  
  throw new Error('No fetch implementation found. Please provide a fetch function or install node-fetch for Node.js.');
}
