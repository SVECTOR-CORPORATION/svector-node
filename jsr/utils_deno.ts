/**
 * Utilities for SVECTOR SDK in Deno/JSR environment
 */

/**
 * Convert various types of data to File objects
 */
export async function toFile(
  value: string | Uint8Array | ArrayBuffer,
  filename?: string,
  options?: FilePropertyBag
): Promise<File> {
  // Handle Uint8Array
  if (value instanceof Uint8Array) {
    return new File([value], filename || 'file.bin', options);
  }

  // Handle ArrayBuffer
  if (value instanceof ArrayBuffer) {
    return new File([value], filename || 'file.bin', options);
  }

  // Handle string
  if (typeof value === 'string') {
    return new File([value], filename || 'file.txt', { type: 'text/plain', ...options });
  }

  throw new Error('Unsupported file type');
}

/**
 * Check if running in Node.js environment
 */
function isNode(): boolean {
  try {
    return typeof globalThis !== 'undefined' &&
           (globalThis as any).process?.versions?.node != null;
  } catch {
    return false;
  }
}

/**
 * Check if running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).document !== 'undefined';
}

/**
 * Check if running in Deno environment
 */
function isDeno(): boolean {
  return typeof globalThis !== 'undefined' && (globalThis as any).Deno != null;
}

/**
 * Get a fetch implementation for the current environment
 */
export function getFetch(): typeof fetch {
  // Use globalThis.fetch if available (standard in modern environments)
  if (typeof globalThis !== 'undefined' && globalThis.fetch) {
    return globalThis.fetch;
  }

  // Use window.fetch if in browser
  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch;
  }

  throw new Error('No fetch implementation found');
}
