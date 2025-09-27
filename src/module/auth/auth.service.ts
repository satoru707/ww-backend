import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma.service';
import { Response } from 'express';
import {
  ApiResponse,
  createErrorResponse,
  createSuccessResponse,
} from 'src/common/response.util';
import { AuthEntity } from './entities/auth.entity';
import bcrypt from 'node_modules/bcryptjs';
import qrcode from 'qrcode';
import speakeasy from '@levminer/speakeasy';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async create(createAuthDto: CreateAuthDto) {
    try {
      const hashed = await bcrypt.hash(createAuthDto.password, 10);
      const userExists = await this.prisma.user.findFirst({
        where: { email: createAuthDto.email },
      });
      if (userExists) {
        return createErrorResponse([{ message: 'User already exists' }]);
      }
      const user = await this.prisma.user.create({
        data: {
          name: createAuthDto.name,
          email: createAuthDto.email,
          password: hashed,
        },
      });
      const nonce = crypto.randomBytes(32).toString('hex');
      await send_mail(user, nonce);
      await this.prisma.token.create({
        data: {
          user_id: user.id,
          token: nonce,
          type: 'CONFIRMATION',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      return createSuccessResponse('Verify Email');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error creating email' }]);
    }
  }

  async login(
    checkAuthDto: { email: string; password: string },
    res: Response,
  ) {
    try {
      const userExists = await this.prisma.user.findFirst({
        where: { email: checkAuthDto.email },
        include: { tokens: true },
      });
      if (!userExists)
        return createErrorResponse([{ message: 'User does not exist' }]);
      const pass = bcrypt.compare(checkAuthDto.password, userExists.password);
      if (!pass)
        return createErrorResponse([{ message: 'Invalid Credentials' }]);
      if (userExists.status == 'PENDING') {
        // resend a verification mail
        await send_mail(userExists, userExists.tokens[0].token);
        return createErrorResponse([{ message: 'Verify email' }]);
      }

      if (userExists.is2FAEnabled) return createSuccessResponse('2FA Enabled');
      await set_token(userExists, res);
      return createSuccessResponse('Login successful');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error logging in' }]);
    }
  }

  async refresh(res: Response) {
    try {
      const refresh = res.req.cookies.refresh_token;
      if (!refresh)
        return createErrorResponse([{ message: 'No refresh token' }]);
      const valid_token = await this.prisma.token.findFirst({
        where: { token: refresh },
        include: { user: true },
      });
      if (!valid_token)
        return createErrorResponse([{ message: 'Invalid or Expired token' }]);
      if (valid_token.expiresAt < new Date())
        return createErrorResponse([{ message: 'Invalid or Expired token' }]);
      await set_token(valid_token.user, res);
      return createSuccessResponse('Tokens refreshed');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error returning access token' }]);
    }
  }

  async enable_two_factor_auth(user_id: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: user_id },
      });
      if (!user)
        return createErrorResponse([{ message: 'User does not exist' }]);
      const secret = speakeasy.generateSecret({
        length: 25,
        name: `Wealth Wave ${user.email}`,
      });
      this.prisma.user.update({
        where: { id: user_id },
        data: { is2FAEnabled: true, two_factor_secret: secret.base32 },
      });
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
      return createSuccessResponse({ qrCodeUrl });
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error enabling 2FA' }]);
    }
  }

  async verify_2fa(user_email: string, res: Response) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: user_email },
      });
      if (!user || !user.is2FAEnabled || !user.two_factor_secret) {
        return createErrorResponse([{ message: '2FA not enabled' }]);
      }
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: user.two_factor_secret,
      });
      if (!verified) {
        return createErrorResponse([{ message: 'Invalid 2FA code' }]);
      }
      await set_token(user, res);
      return createSuccessResponse('2FA Enabled');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error' }]);
    }
  }
}

async function set_token(
  user: { name: string; email: string; id: string },
  res: Response,
) {
  try {
    const nonce = crypto.randomBytes(32).toString('hex');
    const token_exists = await this.prisma.token.findFirst({
      where: { user_id: user.id, type: 'REFRESH' },
    });
    if (token_exists) {
      await this.prisma.token.update({
        where: {
          id: token_exists.id,
          user_id: user.id,
          type: 'REFRESH',
        },
        data: {
          token: nonce,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
    } else {
      await this.prisma.token.create({
        data: {
          user_id: user.id,
          token: nonce,
          type: 'REFRESH',
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
    }

    const jwt_token = sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );
    res.cookie('access_token', jwt_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2000,
      sameSite: 'strict',
    });
    res.cookie('refresh_token', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 48 * 60 * 60 * 1000,
      sameSite: 'strict',
    });
  } catch (error) {
    console.error(error);
  }
}

async function send_mail(user: { email: string; name: string }, nonce: string) {
  console.log('Sending mail');
}
