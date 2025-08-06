import { SVECTOR } from '../client';
import { APIConnectionTimeoutError } from '../errors';
import {
  ChatCompletionRequest,
  ImageAnalysisRequest,
  ImageAnalysisResponse,
  MessageContent,
  RequestOptions,
  VisionRequest,
  VisionResponse
} from '../types';

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
      'https://api.svector.co.in/api/chat/completions',
      'https://spec-chat.tech/api/chat/completions'
    ];
    
    const headers = {
      'Authorization': `Bearer ${(this.client as any).apiKey}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    };

    const requestBody = JSON.stringify(chatRequest);
    // Reduce default timeout for vision requests to prevent hanging
    const timeout = options?.timeout || 60000; // 60 seconds instead of 120
    const maxRetries = options?.maxRetries || 2; // Allow custom retry count

    console.log(`🔍 Vision API: Starting request with ${timeout}ms timeout...`);

    for (const [endpointIndex, endpoint] of endpoints.entries()) {
      console.log(`🌐 Trying endpoint ${endpointIndex + 1}/${endpoints.length}: ${endpoint}`);
      
      for (let retry = 0; retry < maxRetries; retry++) {
        console.log(`🔄 Attempt ${retry + 1}/${maxRetries} for endpoint ${endpointIndex + 1}`);
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log(`⏰ Request timeout after ${timeout}ms, aborting...`);
            controller.abort();
          }, timeout);

          const requestStart = Date.now();
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: requestBody,
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          const requestDuration = Date.now() - requestStart;
          console.log(`⚡ Request completed in ${requestDuration}ms`);

          if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ HTTP ${response.status}: ${errorText}`);
            
            // Handle specific HTTP status codes
            if (response.status === 504) {
              throw new APIConnectionTimeoutError(`Gateway timeout: The image processing took too long. Try using a smaller image or 'low' detail setting.`);
            } else if (response.status === 413) {
              throw new Error(`Image too large: Please use a smaller image file or reduce the image resolution.`);
            } else if (response.status === 429) {
              throw new Error(`Rate limit exceeded: Please wait before making another request.`);
            } else if (response.status >= 400 && response.status < 500) {
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            if (retry === maxRetries - 1) {
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            continue;
          }

          const result = await response.json();
          console.log(`✅ Vision API request successful`);
          return result;

        } catch (error) {
          const isLastRetry = retry === maxRetries - 1;
          const isLastEndpoint = endpointIndex === endpoints.length - 1;
          
          if (error instanceof Error) {
            console.log(`🚨 Request error: ${error.name} - ${error.message}`);
            
            // Handle AbortError (timeout)
            if (error.name === 'AbortError') {
              if (isLastRetry && isLastEndpoint) {
                throw new APIConnectionTimeoutError(
                  `Vision API request timed out after ${timeout}ms. This may be due to a large image or server overload. Try using a smaller image, setting detail to 'low', or increasing the timeout.`
                );
              }
            }
            
            // Handle fetch/network errors
            if (error.message.includes('fetch') || error.message.includes('network')) {
              if (isLastRetry && isLastEndpoint) {
                throw new Error(`Network error: Unable to connect to vision API. Please check your internet connection.`);
              }
            }
            
            // Re-throw timeout errors immediately
            if (error instanceof APIConnectionTimeoutError) {
              throw error;
            }
            
            if (isLastRetry && isLastEndpoint) {
              throw new Error(`Vision API request failed: ${error.message}`);
            }
            
            // Exponential backoff for retries
            if (!isLastRetry || !isLastEndpoint) {
              const delay = Math.min(1000 * Math.pow(2, retry), 5000);
              console.log(`⏳ Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
      }
    }
    
    throw new Error('Vision API request failed after multiple retries on all endpoints');
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

    // Log the image being processed
    if (image_url) {
      console.log(`Processing image from URL: ${image_url.substring(0, 80)}...`);
    } else if (image_base64) {
      console.log(`Processing image from base64 data (${image_base64.length} chars)`);
    } else if (file_id) {
      console.log(`Processing image from file ID: ${file_id}`);
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
      const response = await this.makeVisionRequest(chatRequest, {
        timeout: options?.timeout || 60000, // Default 60 second timeout
        maxRetries: options?.maxRetries || 2,
        ...options
      });
      
      const analysis = response.choices?.[0]?.message?.content;
      if (!analysis) {
        throw new Error('No analysis content returned from API');
      }

      return {
        analysis,
        usage: response.usage,
        _request_id: response._request_id
      };
    } catch (error) {
      if (error instanceof APIConnectionTimeoutError) {
        // Re-throw timeout errors with additional context
        throw new APIConnectionTimeoutError(
          `${error.message}\n\nTroubleshooting tips:\n` +
          `• Try reducing image size or resolution\n` +
          `• Use detail: 'low' instead of 'high'\n` +
          `• Check if the image URL is accessible\n` +
          `• Consider using a different image format`
        );
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // More specific error handling
      if (errorMessage.includes('504') || errorMessage.includes('Gateway timeout')) {
        throw new APIConnectionTimeoutError(`Image processing timed out. The image may be too large or complex. Try using a smaller image or setting detail to 'low'.`);
      } else if (errorMessage.includes('413') || errorMessage.includes('too large')) {
        throw new Error(`Image too large. Please use a smaller image file or reduce the image resolution.`);
      } else if (errorMessage.includes('401') || errorMessage.includes('Authentication')) {
        throw new Error(`Authentication failed. Please check your API key.`);
      } else if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
        throw new Error(`Rate limit exceeded. Please wait before retrying.`);
      }
      
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
      timeout?: number;
      maxRetries?: number;
    }
  ): Promise<ImageAnalysisResponse> {
    const { timeout, maxRetries, ...analysisOptions } = options || {};
    
    return this.analyze({
      image_url: imageUrl,
      prompt,
      ...analysisOptions
    }, {
      timeout,
      maxRetries
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
      timeout?: number;
      maxRetries?: number;
    }
  ): Promise<ImageAnalysisResponse> {
    const { timeout, maxRetries, ...analysisOptions } = options || {};
    
    return this.analyze({
      image_base64: base64Data,
      prompt,
      ...analysisOptions
    }, {
      timeout,
      maxRetries
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
      timeout?: number;
      maxRetries?: number;
    }
  ): Promise<ImageAnalysisResponse> {
    const { timeout, maxRetries, ...analysisOptions } = options || {};
    
    return this.analyze({
      file_id: fileId,
      prompt,
      ...analysisOptions
    }, {
      timeout,
      maxRetries
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
        analysis: response.choices?.[0]?.message?.content || 'No analysis generated',
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
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : undefined;
    
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
