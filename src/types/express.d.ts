import 'express';

declare global {
  namespace Express {
    interface Request {
      // cookie-parser populates this; define as string map for safer access
      cookies: Record<string, string>;
      // attach a typed user payload after JWT verification
      user?: {
        sub?: string;
        email?: string;
        role?: string;
        [k: string]: unknown;
      };
    }
  }
}

export {};
