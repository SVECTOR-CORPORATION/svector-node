import { SVECTOR } from '../client';
import { FileUploadResponse, RequestOptions } from '../types';
import { toFile } from '../utils';

export class Files {
  constructor(private client: SVECTOR) {}

  /**
   * Upload files to SVECTOR's system to enable RAG responses
   */
  async create(
    file: File | NodeJS.ReadableStream | Buffer | Uint8Array | string,
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
    if (typeof window !== 'undefined') {
      throw new Error('createFromPath() is only available in Node.js environments');
    }

    try {
      const fs = require('fs');
      const path = require('path');
      
      const fileStream = fs.createReadStream(filePath);
      const fileName = path.basename(filePath);
      
      return this.create(fileStream, purpose, fileName, options);
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  }
}
