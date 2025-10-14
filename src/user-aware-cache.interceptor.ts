import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';

@Injectable()
export class UserAwareCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    if (request.method !== 'GET') return undefined;
    const token = request.cookies.access_token;
    if (!token) return undefined;
    if (!process.env.JWT_SECRET) return undefined;
    const payload = verify(token, process.env.JWT_SECRET) as jwtPayload;
    const userId = payload.sub;
    if (!userId) return undefined;

    const url = request.url;
    return `${userId}:${url}`;
  }
}
