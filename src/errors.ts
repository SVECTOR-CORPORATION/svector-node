// Custom error classes for SVECTOR SDK

export class SVECTORError extends Error {
  public readonly status?: number;
  public readonly request_id?: string;
  public readonly headers?: Record<string, string>;

  constructor(
    message: string,
    status?: number,
    request_id?: string,
    headers?: Record<string, string>
  ) {
    super(message);
    this.name = 'SVECTORError';
    this.status = status;
    this.request_id = request_id;
    this.headers = headers;
  }
}

export class APIError extends SVECTORError {
  constructor(
    message: string,
    status?: number,
    request_id?: string,
    headers?: Record<string, string>
  ) {
    super(message, status, request_id, headers);
    this.name = 'APIError';
  }
}

export class AuthenticationError extends SVECTORError {
  constructor(
    message: string = 'Authentication failed',
    request_id?: string,
    headers?: Record<string, string>
  ) {
    super(message, 401, request_id, headers);
    this.name = 'AuthenticationError';
  }
}

export class PermissionDeniedError extends SVECTORError {
  constructor(
    message: string = 'Permission denied',
    request_id?: string,
    headers?: Record<string, string>
  ) {
    super(message, 403, request_id, headers);
    this.name = 'PermissionDeniedError';
  }
}

export class NotFoundError extends SVECTORError {
  constructor(
    message: string = 'Resource not found',
    request_id?: string,
    headers?: Record<string, string>
  ) {
    super(message, 404, request_id, headers);
    this.name = 'NotFoundError';
  }
}

export class UnprocessableEntityError extends SVECTORError {
  constructor(
    message: string = 'Unprocessable entity',
    request_id?: string,
    headers?: Record<string, string>
  ) {
    super(message, 422, request_id, headers);
    this.name = 'UnprocessableEntityError';
  }
}

export class RateLimitError extends SVECTORError {
  constructor(
    message: string = 'Rate limit exceeded',
    request_id?: string,
    headers?: Record<string, string>
  ) {
    super(message, 429, request_id, headers);
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends SVECTORError {
  constructor(
    message: string = 'Internal server error',
    status: number = 500,
    request_id?: string,
    headers?: Record<string, string>
  ) {
    super(message, status, request_id, headers);
    this.name = 'InternalServerError';
  }
}

export class APIConnectionError extends SVECTORError {
  constructor(message: string = 'Connection error') {
    super(message);
    this.name = 'APIConnectionError';
  }
}

export class APIConnectionTimeoutError extends APIConnectionError {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'APIConnectionTimeoutError';
  }
}
