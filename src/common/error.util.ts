import { Logger } from '@nestjs/common';

const logger = new Logger('ErrorUtil');

export function safeErrorMessage(err: unknown): string {
  try {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    return JSON.stringify(err as object);
  } catch (e) {
    logger.error('Failed to stringify error', e);
    return 'Unknown error';
  }
}
