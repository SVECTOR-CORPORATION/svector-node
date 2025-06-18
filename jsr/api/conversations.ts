import { SVECTOR } from '../client.ts';
import {
    ChatCompletionRequest,
    ChatMessage,
    ConversationRequest,
    ConversationResponse,
    RequestOptions,
    StreamEvent
} from '../types.ts';

export class Conversations {
  constructor(private client: SVECTOR) {}

  /**
   * Create a conversation with instructions and input
   * This automatically handles the system/user role conversion internally
   */
  async create(
    params: ConversationRequest,
    options?: RequestOptions
  ): Promise<ConversationResponse> {
    // Convert the interface to the internal chat completion format
    const messages = this.buildMessagesFromConversation(params);
    
    const chatRequest: ChatCompletionRequest = {
      model: params.model,
      messages,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      stream: false,
      files: params.files,
    };

    const response = await this.client.chat.create(chatRequest, options);
    
    // Convert back to format
    return {
      output: response.choices[0]?.message?.content || '',
      usage: response.usage,
      _request_id: response._request_id,
    };
  }

  /**
   * Create a streaming conversation with instructions and input
   */
  async createStream(
    params: ConversationRequest & { stream: true },
    options?: RequestOptions
  ): Promise<AsyncIterable<{ content: string; done: boolean }>> {
    const messages = this.buildMessagesFromConversation(params);
    
    const chatRequest: ChatCompletionRequest & { stream: true } = {
      model: params.model,
      messages,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      stream: true,
      files: params.files,
    };

    const stream = await this.client.chat.createStream(chatRequest, options);
    
    // Convert internal stream format to format
    return this.transformStream(stream);
  }

  /**
   * Create conversation with response metadata
   */
  async createWithResponse(
    params: ConversationRequest,
    options?: RequestOptions
  ): Promise<{ data: ConversationResponse; response: Response }> {
    const messages = this.buildMessagesFromConversation(params);
    
    const chatRequest: ChatCompletionRequest = {
      model: params.model,
      messages,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      stream: false,
      files: params.files,
    };

    const { data, response } = await this.client.chat.createWithResponse(chatRequest, options);
    
    return {
      data: {
        output: data.choices[0]?.message?.content || '',
        usage: data.usage,
        _request_id: data._request_id,
      },
      response,
    };
  }

  /**
   * Internal method to build messages from conversation parameters
   */
  private buildMessagesFromConversation(params: ConversationRequest): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Add system instructions if provided
    if (params.instructions) {
      messages.push({
        role: 'system',
        content: params.instructions,
      });
    }

    // Add context messages if provided
    if (params.context && params.context.length > 0) {
      for (let i = 0; i < params.context.length; i++) {
        const contextMsg = params.context[i];
        if (contextMsg) {
          // Alternate between user and assistant for context
          const role = i % 2 === 0 ? 'user' : 'assistant';
          messages.push({
            role: role as 'user' | 'assistant',
            content: contextMsg,
          });
        }
      }
    }

    // Add the current user input
    messages.push({
      role: 'user',
      content: params.input,
    });

    return messages;
  }

  /**
   * Transform internal stream events to format
   */
  private async *transformStream(
    stream: AsyncIterable<StreamEvent>
  ): AsyncIterable<{ content: string; done: boolean }> {
    for await (const event of stream) {
      if (event.choices?.[0]?.delta?.content) {
        yield {
          content: event.choices[0].delta.content,
          done: false,
        };
      } else if (event.choices?.[0]?.finish_reason) {
        yield {
          content: '',
          done: true,
        };
      }
    }
  }
}
