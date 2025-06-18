import { SVECTOR } from '../client.ts';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  RequestOptions,
  StreamEvent
} from '../types.ts';

export class ChatCompletions {
  constructor(private client: SVECTOR) {}

  /**
   * Creates a chat completion using SVECTOR's Spec-Chat models
   */
  async create(
    params: ChatCompletionRequest,
    options?: RequestOptions
  ): Promise<ChatCompletionResponse> {
    if (params.stream) {
      throw new Error('Use createStream() for streaming responses');
    }

    return this.client.request<ChatCompletionResponse>(
      'POST',
      '/api/chat/completions',
      params,
      options
    );
  }

  /**
   * Creates a streaming chat completion
   */
  async createStream(
    params: ChatCompletionRequest & { stream: true },
    options?: RequestOptions
  ): Promise<AsyncIterable<StreamEvent>> {
    const response = await this.client.requestStream(
      'POST',
      '/api/chat/completions',
      { ...params, stream: true },
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
