import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { Roles } from './role.decorator';
import { jwtPayload } from 'src/types/types';
import { log } from 'console';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const roles = this.reflector.get(Roles, context.getHandler());
      const req = context.switchToHttp().getRequest();
      const token = req.cookies.access_token;
      if (!process.env.JWT_SECRET) return false;
      const payload = verify(token, process.env.JWT_SECRET) as jwtPayload;
      console.log('Roles', roles);
      for (const role of roles) {
        if (role.toLowerCase() == payload.role.toLowerCase()) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
