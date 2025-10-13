export interface ApiResponse<T> {
  data: T | null;
  meta?: {
    pagination?: { page: number; limit: number; total: number };
    timestamp: string;
    // allow additional metadata keys but keep them typed
    [key: string]: unknown;
  };
  errors: { message: string; code?: string }[] | null;
}

export function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta'],
): ApiResponse<T> {
  return {
    data,
    meta: { timestamp: new Date().toISOString(), ...meta },
    errors: null,
  };
}

export function createErrorResponse<T>(
  errors: { message: string; code?: string }[],
): ApiResponse<T> {
  return {
    data: null,
    meta: { timestamp: new Date().toISOString() },
    errors,
  };
}
