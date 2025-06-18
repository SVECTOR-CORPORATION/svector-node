import { SVECTOR } from '../client.ts';
import { FileUploadResponse, RequestOptions } from '../types.ts';
import { toFile } from '../utils.ts';

export class Files {
  constructor(private client: SVECTOR) {}

  /**
   * Upload files to SVECTOR's system to enable RAG responses
   */
  async create(
    file: File | Uint8Array | string,
    purpose: string = 'rag',
    filename?: string,
    options?: RequestOptions
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    
    // Convert various input types to File
    let fileToUpload: File;
    
    if (file instanceof File) {
      fileToUpload = file;
    } else {
      fileToUpload = await toFile(file, filename);
    }
    
    formData.append('file', fileToUpload);
    formData.append('purpose', purpose);

    return this.client.request<FileUploadResponse>(
      'POST',
      '/api/v1/files/',
      formData,
      {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options?.headers,
        },
      }
    );
  }

  /**
   * Upload a file from a file path (Node.js only)
   */
  async createFromPath(
    filePath: string,
    purpose: string = 'rag',
    options?: RequestOptions
  ): Promise<FileUploadResponse> {
    try {
      // Read file using Deno.readFile
      const fileData = await (globalThis as any).Deno?.readFile(filePath);
      if (!fileData) {
        throw new Error('File reading not supported in this environment');
      }
      
      const filename = filePath.split('/').pop() || 'unknown';
      return this.create(fileData, purpose, filename, options);
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
