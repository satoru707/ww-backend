import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { verify } from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const token = req.cookies['access_token'];
      if (!token) return false;
      const payload = verify(token, process.env.JWT_SECRET);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) return false;
      // dynamic roles
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
