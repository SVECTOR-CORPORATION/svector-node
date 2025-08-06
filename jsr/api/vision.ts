import { SVECTOR } from '../client.ts';
import {
  ChatCompletionRequest,
  ImageAnalysisRequest,
  ImageAnalysisResponse,
  MessageContent,
  RequestOptions,
  VisionRequest,
  VisionResponse
} from '../types.ts';

export class Vision {
  constructor(private client: SVECTOR) {}

      /**
   * Make a direct API call to SVECTOR vision endpoint
   */
  private async makeVisionRequest(
    chatRequest: ChatCompletionRequest,
    options?: RequestOptions
  ): Promise<any> {
    const baseURL = (this.client as any).baseURL;
    
    const endpoints = [
      `${baseURL}/api/chat/completions`,
      'https://spec-chat.tech/api/chat/completions',
      'https://spec-chat.tech/api/chat/completions'
    ];
    
    const headers = {
      'Authorization': `Bearer ${(this.client as any).apiKey}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    };

    const requestBody = JSON.stringify(chatRequest);
    const timeout = options?.timeout || 60000; // Default to 60 seconds
    const maxRetries = 2;

    for (const [endpointIndex, endpoint] of endpoints.entries()) {
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: requestBody,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            
            // For 4xx errors, don't retry - these are client errors
            if (response.status >= 400 && response.status < 500) {
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            // For 5xx errors (server errors like 524 timeout), retry with next endpoint or retry
            if (response.status >= 500) {
              const isLastRetry = retry === maxRetries - 1;
              const isLastEndpoint = endpointIndex === endpoints.length - 1;
              
              if (isLastRetry && isLastEndpoint) {
                throw new Error(`HTTP ${response.status}: ${errorText}`);
              }
              
              // If not last retry or not last endpoint, continue to retry
              continue;
            }
            
            // For other errors, treat as retry-able
            if (retry === maxRetries - 1) {
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            continue;
          }

          return await response.json();

        } catch (error) {
          const isLastRetry = retry === maxRetries - 1;
          const isLastEndpoint = endpointIndex === endpoints.length - 1;
          
          if (error instanceof Error) {
            if (error.name === 'AbortError' || error.message.includes('fetch')) {
              if (!isLastRetry || !isLastEndpoint) {
                const delay = Math.min(1000 * Math.pow(2, retry), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }
            }
            
            if (isLastRetry && isLastEndpoint) {
              throw new Error(`Vision API request failed: ${error.message}`);
            }
          }
        }
      }
    }
    
    throw new Error('Vision API request failed after multiple retries');
  }

  /**
   * Analyze an image using SVECTOR's vision capabilities
   * Supports URL, base64, and file ID inputs
   */
  async analyze(
    params: ImageAnalysisRequest,
    options?: RequestOptions
  ): Promise<ImageAnalysisResponse> {
    const { image_url, image_base64, file_id, prompt, model, max_tokens, temperature, detail } = params;

    if (!image_url && !image_base64 && !file_id) {
      throw new Error('Must provide one of: image_url, image_base64, or file_id');
    }

    const messageContent: MessageContent[] = [
      {
        type: 'text',
        text: prompt || 'Analyze this image and describe what you see in detail.'
      }
    ];

    if (image_url) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: image_url,
          detail: detail || 'auto'
        }
      });
    } else if (image_base64) {
      const dataUrl = image_base64.startsWith('data:') 
        ? image_base64 
        : `data:image/jpeg;base64,${image_base64}`;
      
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: dataUrl,
          detail: detail || 'auto'
        }
      });
    } else if (file_id) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: `file://${file_id}`,
          detail: detail || 'auto'
        }
      });
    }

    const chatRequest: ChatCompletionRequest = {
      model: model || 'spec-3-turbo',
      messages: [{
        role: 'user',
        content: messageContent
      }],
      max_tokens: max_tokens || 1000,
      temperature: temperature || 0.7
    };

    try {
      const response = await this.makeVisionRequest(chatRequest, options);
      
      return {
        analysis: response.choices?.[0]?.message?.content || 'No analysis generated',
        usage: response.usage,
        _request_id: response._request_id
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Vision analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Analyze an image from a URL
   */
  async analyzeFromUrl(
    imageUrl: string,
    prompt?: string,
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      detail?: 'low' | 'high' | 'auto';
    }
  ): Promise<ImageAnalysisResponse> {
    return this.analyze({
      image_url: imageUrl,
      prompt,
      ...options
    });
  }

  /**
   * Analyze an image from base64 data
   */
  async analyzeFromBase64(
    base64Data: string,
    prompt?: string,
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      detail?: 'low' | 'high' | 'auto';
    }
  ): Promise<ImageAnalysisResponse> {
    return this.analyze({
      image_base64: base64Data,
      prompt,
      ...options
    });
  }

  /**
   * Analyze an uploaded file by file ID
   */
  async analyzeFromFileId(
    fileId: string,
    prompt?: string,
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      detail?: 'low' | 'high' | 'auto';
    }
  ): Promise<ImageAnalysisResponse> {
    return this.analyze({
      file_id: fileId,
      prompt,
      ...options
    });
  }

  /**
   * Compare multiple images
   */
  async compareImages(
    images: Array<{
      url?: string;
      base64?: string;
      file_id?: string;
    }>,
    prompt?: string,
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      detail?: 'low' | 'high' | 'auto';
    }
  ): Promise<ImageAnalysisResponse> {
    const messageContent: MessageContent[] = [
      {
        type: 'text',
        text: prompt || 'Compare these images and describe the similarities and differences.'
      }
    ];

    // Add all images to the message content
    for (const image of images) {
      if (image.url) {
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: image.url,
            detail: options?.detail || 'auto'
          }
        });
      } else if (image.base64) {
        const dataUrl = image.base64.startsWith('data:') 
          ? image.base64 
          : `data:image/jpeg;base64,${image.base64}`;
        
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: dataUrl,
            detail: options?.detail || 'auto'
          }
        });
      } else if (image.file_id) {
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: `file://${image.file_id}`,
            detail: options?.detail || 'auto'
          }
        });
      }
    }

    const chatRequest: ChatCompletionRequest = {
      model: options?.model || 'spec-3-turbo',
      messages: [{
        role: 'user',
        content: messageContent
      }],
      max_tokens: options?.max_tokens || 1000,
      temperature: options?.temperature || 0.7
    };

    try {
      const response = await this.makeVisionRequest(chatRequest);
      
      return {
        analysis: response.choices[0]?.message?.content || 'No analysis generated',
        usage: response.usage,
        _request_id: response._request_id
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Image comparison failed: ${errorMessage}`);
    }
  }

  /**
   * Extract text from an image (OCR functionality)
   */
  async extractText(
    params: ImageAnalysisRequest,
    options?: RequestOptions
  ): Promise<ImageAnalysisResponse> {
    return this.analyze({
      ...params,
      prompt: 'Extract and transcribe all text visible in this image. Return only the text content, maintaining the original formatting where possible.'
    }, options);
  }

  /**
   * Describe image for accessibility
   */
  async describeForAccessibility(
    params: ImageAnalysisRequest,
    options?: RequestOptions
  ): Promise<ImageAnalysisResponse> {
    return this.analyze({
      ...params,
      prompt: 'Provide a detailed description of this image suitable for screen readers and accessibility purposes. Include information about colors, layout, text, people, objects, and any other relevant visual elements.'
    }, options);
  }

  /**
   * Analyze image for specific objects or features
   */
  async detectObjects(
    params: ImageAnalysisRequest,
    objectTypes?: string[],
    options?: RequestOptions
  ): Promise<ImageAnalysisResponse> {
    const objectList = objectTypes?.length 
      ? objectTypes.join(', ')
      : 'people, vehicles, animals, furniture, electronics, and other significant objects';

    return this.analyze({
      ...params,
      prompt: `Identify and list all instances of the following objects in this image: ${objectList}. For each object, provide its location, size, and any relevant details.`
    }, options);
  }

  /**
   * Legacy vision method for backward compatibility
   */
  async create(
    params: VisionRequest,
    options?: RequestOptions
  ): Promise<VisionResponse> {
    const analysisParams: ImageAnalysisRequest = {
      image_url: params.image_url,
      image_base64: params.image_base64,
      file_id: params.file_id,
      prompt: params.prompt,
      model: params.model,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      detail: params.detail
    };

    const response = await this.analyze(analysisParams, options);
    
    return {
      analysis: response.analysis,
      usage: response.usage,
      _request_id: response._request_id
    };
  }

  async createResponse(params: {
    model: string;
    input: Array<{
      role: 'user' | 'system' | 'assistant';
      content: Array<{
        type: 'input_text' | 'input_image';
        text?: string;
        image_url?: string;
        file_id?: string;
      }>;
    }>;
    max_tokens?: number;
    temperature?: number;
  }, options?: RequestOptions): Promise<{ output_text: string; usage?: any; _request_id?: string }> {
    const userMessage = params.input.find(msg => msg.role === 'user');
    if (!userMessage) {
      throw new Error('User message is required');
    }

    let prompt = '';
    let imageInput: { image_url?: string; image_base64?: string; file_id?: string } = {};

    for (const content of userMessage.content) {
      if (content.type === 'input_text' && content.text) {
        prompt += content.text + ' ';
      } else if (content.type === 'input_image') {
        if (content.image_url) {
          if (content.image_url.startsWith('data:')) {
            imageInput.image_base64 = content.image_url;
          } else {
            imageInput.image_url = content.image_url;
          }
        } else if (content.file_id) {
          imageInput.file_id = content.file_id;
        }
      }
    }

    const result = await this.analyze({
      ...imageInput,
      prompt: prompt.trim(),
      model: params.model,
      max_tokens: params.max_tokens,
      temperature: params.temperature
    }, options);

    return {
      output_text: result.analysis,
      usage: result.usage,
      _request_id: result._request_id
    };
  }

  /**
   * Batch analyze multiple images
   */
  async batchAnalyze(
    images: Array<{
      image_url?: string;
      image_base64?: string;
      file_id?: string;
      prompt?: string;
    }>,
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      detail?: 'low' | 'high' | 'auto';
      delay?: number; // Delay between requests in ms
    }
  ): Promise<Array<{ analysis: string; usage?: any; error?: string }>> {
    const results: Array<{ analysis: string; usage?: any; error?: string }> = [];
    const delay = options?.delay || 1000;

    for (const [index, image] of images.entries()) {
      try {
        const result = await this.analyze({
          ...image,
          model: options?.model,
          max_tokens: options?.max_tokens,
          temperature: options?.temperature,
          detail: options?.detail
        });

        results.push({
          analysis: result.analysis,
          usage: result.usage
        });

        if (index < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          analysis: '',
          error: errorMessage
        });
      }
    }

    return results;
  }

  /**
   * Analyze image with confidence scoring
   */
  async analyzeWithConfidence(
    params: ImageAnalysisRequest,
    options?: RequestOptions
  ): Promise<ImageAnalysisResponse & { confidence?: number }> {
    const enhancedParams = {
      ...params,
      prompt: (params.prompt || 'Analyze this image') + 
        ' Please also provide a confidence score (0-100) for your analysis at the end in the format: [Confidence: XX%]'
    };

    const result = await this.analyze(enhancedParams, options);
    
    // Extract confidence score if present
    const confidenceMatch = result.analysis.match(/\[Confidence:\s*(\d+)%\]/);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]!, 10) : undefined;
    
    // Remove confidence notation from analysis
    const cleanAnalysis = result.analysis.replace(/\[Confidence:\s*\d+%\]/, '').trim();

    return {
      ...result,
      analysis: cleanAnalysis,
      confidence
    };
  }

  /**
   * Generate image captions optimized for social media
   */
  async generateCaption(
    params: ImageAnalysisRequest,
    style?: 'professional' | 'casual' | 'funny' | 'technical',
    options?: RequestOptions
  ): Promise<ImageAnalysisResponse> {
    const stylePrompts = {
      professional: 'Generate a professional, informative caption for this image suitable for business or educational content.',
      casual: 'Write a casual, friendly caption for this image that would work well on social media.',
      funny: 'Create a humorous, entertaining caption for this image that would get engagement on social media.',
      technical: 'Provide a detailed, technical description of this image suitable for academic or scientific purposes.'
    };

    return this.analyze({
      ...params,
      prompt: stylePrompts[style || 'casual']
    }, options);
  }
}
