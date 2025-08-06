import { ChatCompletions } from './api/chat';
import { Conversations } from './api/conversations';
import { Files } from './api/files';
import { Knowledge } from './api/knowledge';
import { Models } from './api/models';
import {
    APIConnectionError,
    APIConnectionTimeoutError,
    APIError,
    AuthenticationError,
    InternalServerError,
    NotFoundError,
    PermissionDeniedError,
    RateLimitError,
    UnprocessableEntityError
} from './errors';
import { RequestOptions, SVECTOROptions } from './types';

// Environment detection utilities
function isNode(): boolean {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.document !== 'undefined';
}

function isWebWorker(): boolean {
  return typeof (globalThis as any).importScripts === 'function' && 
         typeof self !== 'undefined' && 
         typeof window === 'undefined';
}

function isDeno(): boolean {
  return typeof (globalThis as any).Deno !== 'undefined';
}

function isEdgeRuntime(): boolean {
  return typeof (globalThis as any).EdgeRuntime !== 'undefined';
}

function isSSR(): boolean {
  return typeof window === 'undefined' && 
         typeof process !== 'undefined' && 
         process.env !== undefined;
}

export class SVECTOR {
  private apiKey: string;
  private baseURL: string;
  private maxRetries: number;
  private timeout: number;
  private fetch: typeof fetch;
  private dangerouslyAllowBrowser: boolean;

  public chat: ChatCompletions;
  public conversations: Conversations;
  public models: Models;
  public files: Files;
  public knowledge: Knowledge;

  constructor(options: SVECTOROptions = {}) {
    this.apiKey = options.apiKey || this.getApiKeyFromEnv();
    this.baseURL = options.baseURL?.replace(/\/+$/, '') || 'https://spec-chat.tech';
    this.maxRetries = options.maxRetries ?? 2;
    this.timeout = options.timeout ?? 10 * 60 * 1000; // 10 minutes
    this.fetch = options.fetch || this.getDefaultFetch();
    this.dangerouslyAllowBrowser = options.dangerouslyAllowBrowser ?? false;

    if (!this.apiKey) {
      throw new AuthenticationError(
        'SVECTOR API key is required. Set it via the apiKey option or SVECTOR_API_KEY environment variable.'
      );
    }

    // Security check for browser environments
    this.checkBrowserEnvironment();

    // Initialize API endpoints
    this.chat = new ChatCompletions(this);
    this.conversations = new Conversations(this);
    this.models = new Models(this);
    this.files = new Files(this);
    this.knowledge = new Knowledge(this);
  }

  private getApiKeyFromEnv(): string {
    if (typeof process !== 'undefined' && process.env) {
      return process.env['SVECTOR_API_KEY'] || '';
    }
    return '';
  }

  private getDefaultFetch(): typeof fetch {
    // Try different fetch implementations based on environment
    
    // 1. User-provided fetch (highest priority)
    if (typeof globalThis !== 'undefined' && globalThis.fetch) {
      return globalThis.fetch.bind(globalThis);
    }
    
    // 2. Browser fetch
    if (typeof window !== 'undefined' && window.fetch) {
      return window.fetch.bind(window);
    }
    
    // 3. Node.js global fetch (Node 18+)
    if (typeof global !== 'undefined' && (global as any).fetch) {
      return (global as any).fetch;
    }
    
    // 4. Deno fetch
    if (isDeno() && (globalThis as any).fetch) {
      return (globalThis as any).fetch;
    }
    
    // 5. Web Worker fetch
    if (isWebWorker() && typeof self !== 'undefined' && (self as any).fetch) {
      return (self as any).fetch;
    }
    
    // 6. Try dynamic import for Node.js environments without global fetch
    if (isNode()) {
      try {
        // This will be handled at runtime
        const nodeFetch = require('node-fetch');
        return nodeFetch.default || nodeFetch;
      } catch (error) {
        console.warn('SVECTOR SDK: node-fetch not available, falling back to native fetch');
      }
    }
    
    throw new Error(
      'No fetch implementation found. Please provide a fetch function via the fetch option, ' +
      'or install node-fetch in Node.js environments.'
    );
  }

  private checkBrowserEnvironment(): void {
    // Allow usage in SSR environments (Next.js, SvelteKit, etc.)
    if (isSSR()) {
      return;
    }

    // Allow usage in Edge Runtime environments (Vercel Edge Functions, etc.)
    if (isEdgeRuntime()) {
      return;
    }

    // Allow usage in Web Workers
    if (isWebWorker()) {
      return;
    }

    // Allow usage in Deno
    if (isDeno()) {
      return;
    }

    // Only restrict in actual browser environments
    if (isBrowser() && !this.dangerouslyAllowBrowser) {
      throw new Error(
        'SVECTOR SDK is being used in a browser environment without dangerouslyAllowBrowser set to true. ' +
        'This is strongly discouraged as it exposes your API key to client-side code. ' +
        'If you understand the risks, set dangerouslyAllowBrowser: true in the constructor options.'
      );
    }
  }

  /**
   * Make a request to the SVECTOR API
   */
  async request<T>(
    method: string,
    path: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = new URL(`${this.baseURL}${path}`);
    
    // Add query parameters
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = this.buildHeaders(body, options.headers);
    const maxRetries = options.maxRetries ?? this.maxRetries;
    const timeout = options.timeout ?? this.timeout;

    let retries = 0;
    while (retries <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestBody = this.prepareRequestBody(body);
        
        const response = await this.fetch(url.toString(), {
          method,
          headers,
          body: requestBody,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          throw this.createErrorFromResponse(response, errorData);
        }

        const responseData = await response.json();
        
        // Add request ID to response if available
        const requestId = response.headers.get('x-request-id');
        if (requestId && typeof responseData === 'object' && responseData !== null) {
          responseData._request_id = requestId;
        }

        return responseData as T;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new APIConnectionTimeoutError('Request timed out');
        }

        if (err instanceof APIError && this.shouldRetry(err.status, retries, maxRetries)) {
          retries++;
          await this.sleep(this.calculateBackoffDelay(retries));
          continue;
        }

        if (retries === maxRetries) {
          throw new APIConnectionError('Max retries exceeded');
        }

        throw err;
      }
    }

    throw new APIConnectionError('Unexpected error');
  }

  /**
   * Make a streaming request to the SVECTOR API
   */
  async requestStream(
    method: string,
    path: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<Response> {
    const url = new URL(`${this.baseURL}${path}`);
    
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = {
      ...this.buildHeaders(body, options.headers),
      'Accept': 'text/event-stream',
    };

    const controller = new AbortController();
    const timeout = options.timeout ?? this.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await this.fetch(url.toString(), {
        method,
        headers,
        body: this.prepareRequestBody(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw this.createErrorFromResponse(response, errorData);
      }

      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new APIConnectionTimeoutError('Request timed out');
      }
      throw err;
    }
  }

  /**
   * Get both parsed data and raw response
   */
  async withResponse<T>(
    method: string,
    path: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<{ data: T; response: Response }> {
    const url = new URL(`${this.baseURL}${path}`);
    
    // Add query parameters
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = this.buildHeaders(body, options.headers);
    const maxRetries = options.maxRetries ?? this.maxRetries;
    const timeout = options.timeout ?? this.timeout;

    let retries = 0;
    while (retries <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestBody = this.prepareRequestBody(body);
        
        const response = await this.fetch(url.toString(), {
          method,
          headers,
          body: requestBody,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          throw this.createErrorFromResponse(response, errorData);
        }

        const responseData = await response.json();
        
        // Add request ID to response if available
        const requestId = response.headers.get('x-request-id');
        if (requestId && typeof responseData === 'object' && responseData !== null) {
          responseData._request_id = requestId;
        }

        return { data: responseData as T, response };
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new APIConnectionTimeoutError('Request timed out');
        }

        if (err instanceof APIError && this.shouldRetry(err.status, retries, maxRetries)) {
          retries++;
          await this.sleep(this.calculateBackoffDelay(retries));
          continue;
        }

        if (retries === maxRetries) {
          throw new APIConnectionError('Max retries exceeded');
        }

        throw err;
      }
    }

    throw new APIConnectionError('Unexpected error');
  }

  private buildHeaders(body: any, customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': 'svector-sdk/1.0.0',
      ...customHeaders,
    };

    // Set Content-Type if not FormData and not already set
    if (body && !(body instanceof FormData) && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  private prepareRequestBody(body: any): string | FormData | undefined {
    if (!body) return undefined;
    if (body instanceof FormData) return body;
    return JSON.stringify(body);
  }

  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  }

  private createErrorFromResponse(response: Response, data: any): APIError {
    const message = data.message || data.error || data.detail || `HTTP ${response.status}`;
    const requestId = response.headers.get('x-request-id') || undefined;
    const headers = Object.fromEntries(response.headers.entries());

    switch (response.status) {
      case 401:
        return new AuthenticationError(message, requestId, headers);
      case 403:
        return new PermissionDeniedError(message, requestId, headers);
      case 404:
        return new NotFoundError(message, requestId, headers);
      case 405:
        return new APIError('Method Not Allowed. Please check the API endpoint and HTTP method.', response.status, requestId, headers);
      case 422:
        return new UnprocessableEntityError(message, requestId, headers);
      case 429:
        return new RateLimitError(message, requestId, headers);
      case 502:
        return new InternalServerError('Bad Gateway - API server temporarily unavailable', response.status, requestId, headers);
      case 503:
        return new InternalServerError('Service Unavailable - API server temporarily overloaded', response.status, requestId, headers);
      case 504:
        return new InternalServerError('Gateway Timeout - API request timed out', response.status, requestId, headers);
      case 524:
        return new InternalServerError('Cloudflare Timeout - Request took too long to process', response.status, requestId, headers);
      default:
        if (response.status >= 500) {
          return new InternalServerError(message, response.status, requestId, headers);
        }
        return new APIError(message, response.status, requestId, headers);
    }
  }

  private shouldRetry(status: number | undefined, retries: number, maxRetries: number): boolean {
    if (retries >= maxRetries) return false;
    if (!status) return false;
    
    // Retry on 408, 409, 429, 502, 503, 504, 524 and other 5xx errors
    return [408, 409, 429, 502, 503, 504, 524].includes(status) || status >= 500;
  }

  private calculateBackoffDelay(retryCount: number): number {
    // Exponential backoff: 2^retryCount * 1000ms
    return Math.min(Math.pow(2, retryCount) * 1000, 8000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generic GET request
   */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * Generic POST request
   */
  async post<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  /**
   * Generic PUT request
   */
  async put<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}
