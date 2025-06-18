import { SVECTOR } from '../client';
import {
  ChatCompletionRequest,
  ChatMessage,
  ConversationRequest,
  ConversationResponse,
  RequestOptions,
  StreamEvent
} from '../types';

export class Conversations {
  constructor(private client: SVECTOR) {}

  /**
   * Create a conversation with instructions and input
   * This automatically handles the system/user role conversion internally
   * Enhanced with better system prompt handling and error recovery
   */
  async create(
    params: ConversationRequest,
    options?: RequestOptions
  ): Promise<ConversationResponse> {
    // Enhanced system prompt handling - can accept various formats
    const systemInstructions = this.normalizeSystemInstructions(params.instructions);
    
    // Convert the interface to the internal chat completion format
    const messages = this.buildMessagesFromConversation(params, systemInstructions);
    
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
    const systemInstructions = this.normalizeSystemInstructions(params.instructions);
    const messages = this.buildMessagesFromConversation(params, systemInstructions);
    
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
    const systemInstructions = this.normalizeSystemInstructions(params.instructions);
    const messages = this.buildMessagesFromConversation(params, systemInstructions);
    
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
   * Normalize system instructions - can handle strings, functions, or complex objects
   */
  private normalizeSystemInstructions(instructions: any): string {
    if (typeof instructions === 'string') {
      return instructions;
    }
    
    if (typeof instructions === 'function') {
      try {
        const result = instructions();
        return typeof result === 'string' ? result : String(result);
      } catch (error) {
        console.warn('SVECTOR: Failed to execute system instructions function:', error);
        return 'You are a helpful assistant.';
      }
    }
    
    if (instructions && typeof instructions === 'object') {
      // Handle objects with a content or text property
      if (instructions.content) return String(instructions.content);
      if (instructions.text) return String(instructions.text);
      if (instructions.value) return String(instructions.value);
      
      // Try to JSON stringify if it's a structured object
      try {
        return JSON.stringify(instructions);
      } catch (error) {
        return String(instructions);
      }
    }
    
    // Fallback for any other type
    return instructions ? String(instructions) : 'You are a helpful assistant.';
  }

  /**
   * Internal method to build messages from conversation parameters
   * Enhanced to handle flexible system instructions
   */
  private buildMessagesFromConversation(
    params: ConversationRequest, 
    systemInstructions?: string
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Add system instructions - use provided or fallback to params
    const finalInstructions = systemInstructions || this.normalizeSystemInstructions(params.instructions);
    if (finalInstructions && finalInstructions.trim()) {
      messages.push({
        role: 'system',
        content: finalInstructions,
      });
    }

    // Add context messages if provided
    if (params.context && params.context.length > 0) {
      for (let i = 0; i < params.context.length; i++) {
        // Alternate between user and assistant for context
        const role = i % 2 === 0 ? 'user' : 'assistant';
        messages.push({
          role: role as 'user' | 'assistant',
          content: params.context[i],
        });
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
