// Type definitions for SVECTOR Spec-Chat API

export interface SVECTOROptions {
  apiKey?: string;
  baseURL?: string;
  maxRetries?: number;
  timeout?: number;
  fetch?: typeof fetch;
  dangerouslyAllowBrowser?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'developer';
  content: string | MessageContent[];
}

export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface FileReference {
  type: 'file' | 'collection';
  id: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  files?: FileReference[];
}

export interface ChatCompletionChoice {
  message: {
    role: string;
    content: string;
  };
  index: number;
  finish_reason?: string;
}

export interface ChatCompletionResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices: ChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _request_id?: string;
}

export interface ModelListResponse {
  models: string[];
  _request_id?: string;
}

export interface FileUploadResponse {
  file_id: string;
  _request_id?: string;
}

export interface KnowledgeAddFileRequest {
  file_id: string;
}

export interface KnowledgeAddFileResponse {
  status: string;
  message?: string;
  _request_id?: string;
}

export interface StreamEvent {
  id?: string;
  event?: string;
  data?: string;
  choices?: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
    finish_reason?: string;
  }>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  query?: Record<string, string>;
  maxRetries?: number;
  timeout?: number;
}

export interface LogLevel {
  level: 'debug' | 'info' | 'warn' | 'error' | 'off';
}

export interface FetchOptions {
  timeout?: number;
  signal?: AbortSignal;
  [key: string]: any;
}

export interface SVECTORRequestInit extends Omit<RequestInit, 'signal' | 'timeout'> {
  timeout?: number;
}

// conversation interface
export interface ConversationRequest {
  model: string;
  instructions?: string; // System instructions
  input: string | MessageContent[]; // User input - now supports text or vision content
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
  files?: FileReference[];
  context?: string[]; // Previous conversation context
}

export interface ConversationResponse {
  output: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _request_id?: string;
}

// Vision API specific types
export interface VisionRequest {
  model: string;
  prompt: string;
  image_url?: string;
  image_base64?: string;
  file_id?: string;
  max_tokens?: number;
  temperature?: number;
  detail?: 'low' | 'high' | 'auto';
}

export interface VisionResponse {
  analysis: string;
  confidence?: number;
  detected_objects?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _request_id?: string;
}

export interface ImageAnalysisRequest {
  image_url?: string;
  image_base64?: string;
  file_id?: string;
  prompt?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  detail?: 'low' | 'high' | 'auto';
}

export interface ImageAnalysisResponse {
  analysis: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _request_id?: string;
}
