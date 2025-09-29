import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from 'src/types/types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.cookies['access_token'];
    try {
      if (!token) return false;
      if (!process.env.JWT_SECRET) return false;
      const payload = verify(token, process.env.JWT_SECRET) as jwtPayload;
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub, status: 'ACTIVE' },
        select: { role: true },
      });
      if (!user) return false;
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
