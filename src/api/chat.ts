import { SVECTOR } from '../client';
import {
    ChatCompletionRequest,
    ChatCompletionResponse,
    RequestOptions,
    StreamEvent
} from '../types';

export class ChatCompletions {
  constructor(private client: SVECTOR) {}

  /**
   * Creates a chat completion using SVECTOR's Spec-Chat models
   * Enhanced with better system prompt handling
   */
  async create(
    params: ChatCompletionRequest,
    options?: RequestOptions
  ): Promise<ChatCompletionResponse> {
    if (params.stream) {
      throw new Error('Use createStream() for streaming responses');
    }

    // Process messages to handle flexible system prompts
    const processedParams = this.processSystemPrompts(params);

    return this.client.request<ChatCompletionResponse>(
      'POST',
      '/api/chat/completions',
      processedParams,
      options
    );
  }

  /**
   * Process system prompts to handle various input formats
   */
  private processSystemPrompts(params: ChatCompletionRequest): ChatCompletionRequest {
    const messages = [...params.messages];
    
    // Find and process system messages
    const processedMessages = messages.map(message => {
      if (message.role === 'system') {
        return {
          ...message,
          content: this.normalizeSystemContent(message.content)
        };
      }
      return message;
    });

    return {
      ...params,
      messages: processedMessages
    };
  }

  /**
   * Normalize system content to handle various formats
   */
  private normalizeSystemContent(content: any): string {
    if (typeof content === 'string') {
      return content;
    }
    
    if (typeof content === 'function') {
      try {
        const result = content();
        return typeof result === 'string' ? result : String(result);
      } catch (error) {
        console.warn('SVECTOR: Failed to execute system content function:', error);
        return 'You are a helpful assistant.';
      }
    }
    
    if (content && typeof content === 'object') {
      // Handle objects with a content or text property
      if (content.content) return String(content.content);
      if (content.text) return String(content.text);
      if (content.value) return String(content.value);
      
      // Try to JSON stringify if it's a structured object
      try {
        return JSON.stringify(content);
      } catch (error) {
        return String(content);
      }
    }
    
    // Fallback for any other type
    return content ? String(content) : 'You are a helpful assistant.';
  }

  /**
   * Creates a streaming chat completion
   * Enhanced with system prompt processing
   */
  async createStream(
    params: ChatCompletionRequest & { stream: true },
    options?: RequestOptions
  ): Promise<AsyncIterable<StreamEvent>> {
    // Process messages to handle flexible system prompts
    const processedParams = this.processSystemPrompts(params);

    const response = await this.client.requestStream(
      'POST',
      '/api/chat/completions',
      { ...processedParams, stream: true },
      options
    );

    return this.parseSSEStream(response);
  }

  /**
   * Creates a chat completion and returns both data and raw response
   */
  async createWithResponse(
    params: ChatCompletionRequest,
    options?: RequestOptions
  ): Promise<{ data: ChatCompletionResponse; response: Response }> {
    if (params.stream) {
      throw new Error('Use createStreamWithResponse() for streaming responses');
    }

    return this.client.withResponse<ChatCompletionResponse>(
      'POST',
      '/api/chat/completions',
      params,
      options
    );
  }

  /**
   * Creates a streaming chat completion and returns both stream and raw response
   */
  async createStreamWithResponse(
    params: ChatCompletionRequest & { stream: true },
    options?: RequestOptions
  ): Promise<{ data: AsyncIterable<StreamEvent>; response: Response }> {
    const response = await this.client.requestStream(
      'POST',
      '/api/chat/completions',
      { ...params, stream: true },
      options
    );

    return {
      data: this.parseSSEStream(response),
      response
    };
  }

  private async *parseSSEStream(response: Response): AsyncIterable<StreamEvent> {
    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === '' || trimmed === 'data: [DONE]') continue;
          
          if (trimmed.startsWith('data: ')) {
            try {
              const data = trimmed.slice(6);
              const parsed = JSON.parse(data);
              yield parsed as StreamEvent;
            } catch (e) {
              // Skip malformed JSON
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
