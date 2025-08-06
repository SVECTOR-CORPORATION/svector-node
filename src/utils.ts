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

  // Handle Buffer (Node.js) - with proper browser compatibility
  if (typeof Buffer !== 'undefined' && value instanceof Buffer) {
    // Convert Buffer to Uint8Array for better browser compatibility
    const uint8Array = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    const blob = new Blob([uint8Array], { type: options?.type || 'application/octet-stream' });
    return new File([blob], filename || 'file', { type: blob.type });
  }

  // Handle Uint8Array
  if (value instanceof Uint8Array) {
    const blob = new Blob([value], { type: options?.type || 'application/octet-stream' });
    return new File([blob], filename || 'file', { type: blob.type });
  }

  // Handle ArrayBuffer
  if (value instanceof ArrayBuffer) {
    const blob = new Blob([value], { type: options?.type || 'application/octet-stream' });
    return new File([blob], filename || 'file', { type: blob.type });
  }

  // Handle string
  if (typeof value === 'string') {
    const blob = new Blob([value], { type: options?.type || 'text/plain' });
    return new File([blob], filename || 'file.txt', { type: blob.type });
  }

  // Handle ReadableStream (with better error handling)
  if (value && typeof value.getReader === 'function') {
    try {
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
    } catch (error) {
      throw new Error(`Failed to read stream: ${error}`);
    }
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

/**
 * Convert image file to base64 data URL
 */
export async function imageToBase64(file: File | Buffer | Uint8Array): Promise<string> {
  if (typeof Buffer !== 'undefined' && file instanceof Buffer) {
    // Node.js Buffer
    const mimeType = detectImageMimeType(file);
    return `data:${mimeType};base64,${file.toString('base64')}`;
  }
  
  if (file instanceof Uint8Array) {
    // Convert Uint8Array to base64
    const mimeType = detectImageMimeType(file);
    const base64 = Buffer.from(file).toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }
  
  if (file instanceof File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  throw new Error('Unsupported file type for base64 conversion');
}

/**
 * Detect image MIME type from file content
 */
export function detectImageMimeType(data: Buffer | Uint8Array): string {
  const bytes = data instanceof Buffer ? data : Buffer.from(data);
  
  // Check PNG signature
  if (bytes.length >= 8 && 
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'image/png';
  }
  
  // Check JPEG signature
  if (bytes.length >= 3 && 
      bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // Check WebP signature
  if (bytes.length >= 12 && 
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }
  
  // Check GIF signature
  if (bytes.length >= 6 && 
      bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif';
  }
  
  // Default to JPEG
  return 'image/jpeg';
}

/**
 * Validate image URL format
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Check if it's a valid URL and has appropriate scheme
    return ['http:', 'https:', 'data:', 'file:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate base64 image format
 */
export function isValidBase64Image(base64: string): boolean {
  if (base64.startsWith('data:image/')) {
    const base64Data = base64.split(',')[1];
    return !!(base64Data && base64Data.length > 0);
  }
  
  // Check if it's a valid base64 string
  try {
    return btoa(atob(base64)) === base64;
  } catch {
    return false;
  }
}

/**
 * Helper to create image content for vision API
 */
export function createImageContent(
  imageInput: string | File | Buffer | Uint8Array,
  text?: string,
  detail?: 'low' | 'high' | 'auto'
): Promise<Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string; detail?: string } }>> {
  return new Promise(async (resolve, reject) => {
    try {
      const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string; detail?: string } }> = [];
      
      // Add text if provided
      if (text) {
        content.push({ type: 'text', text });
      }
      
      // Handle image input
      if (typeof imageInput === 'string') {
        if (isValidImageUrl(imageInput)) {
          content.push({
            type: 'image_url',
            image_url: { url: imageInput, detail: detail || 'auto' }
          });
        } else {
          reject(new Error('Invalid image URL provided'));
          return;
        }
      } else {
        // Convert file/buffer to base64
        const base64Url = await imageToBase64(imageInput);
        content.push({
          type: 'image_url',
          image_url: { url: base64Url, detail: detail || 'auto' }
        });
      }
      
      resolve(content);
    } catch (error) {
      reject(error);
    }
  });
}
