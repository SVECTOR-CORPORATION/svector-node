import { SVECTOR } from '../client.ts';
import {
    KnowledgeAddFileRequest,
    KnowledgeAddFileResponse,
    RequestOptions
} from '../types.ts';

export class Knowledge {
  constructor(private client: SVECTOR) {}

  /**
   * Add a file to a knowledge collection for RAG
   */
  async addFile(
    knowledgeId: string,
    fileId: string,
    options?: RequestOptions
  ): Promise<KnowledgeAddFileResponse> {
    const body: KnowledgeAddFileRequest = { file_id: fileId };
    
    return this.client.request<KnowledgeAddFileResponse>(
      'POST',
      `/api/v1/knowledge/${knowledgeId}/file/add`,
      body,
      options
    );
  }
}
