import { SVECTOR } from '../client';
import { ModelListResponse, RequestOptions } from '../types';

export class Models {
  constructor(private client: SVECTOR) {}

  /**
   * Retrieves all models available on SVECTOR's Spec-Chat platform
   */
  async list(options?: RequestOptions): Promise<ModelListResponse> {
    return this.client.request<ModelListResponse>(
      'GET',
      '/api/models',
      undefined,
      options
    );
  }
}
