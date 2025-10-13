import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { Roles } from './role.decorator';
import { jwtPayload } from 'src/types/types';
import { getAccessTokenFromReq } from 'src/common/cookie.util';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const roles = this.reflector.get(
        Roles,
        context.getHandler(),
      ) as unknown as string[];
      const req = context.switchToHttp().getRequest();
      const t = getAccessTokenFromReq(req);
      if (!process.env.JWT_SECRET) return false;
      const payload = verify(
        t ?? '',
        process.env.JWT_SECRET,
      ) as unknown as jwtPayload;
      console.log('Roles', roles);
      for (const role of roles) {
        if (role.toLowerCase() == payload.role.toLowerCase()) {
          return true;
        }
      }
      return false;
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : String(err));
      return false;
    }
  }
}
