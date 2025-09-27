import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma.service';
import { Response } from 'express';
import {
  ApiResponse,
  createErrorResponse,
  createSuccessResponse,
} from 'src/common/response.util';
import bcrypt from 'node_modules/bcryptjs';
import qrcode from 'qrcode';
import speakeasy from '@levminer/speakeasy';
import { sign } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';

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
      return createErrorResponse([{ message: 'Error creating account' }]);
    }
  }

  async login(checkAuthDto: LoginDto, res: Response) {
    try {
      const userExists = await this.prisma.user.findFirst({
        where: { email: checkAuthDto.email },
        include: { tokens: true },
      });
      if (!userExists)
        return createErrorResponse([{ message: 'User does not exist' }]);
      const pass = bcrypt.compare(checkAuthDto.password, userExists.password);
      if (!pass)
        return createErrorResponse([
          { message: 'Invalid Credentials or Login method' },
        ]);
      if (userExists.status == 'PENDING') {
        // resend a verification mail
        await send_mail(userExists, userExists.tokens[0].token);
        return createErrorResponse([{ message: 'Verify email' }]);
      }

      if (userExists.is2FAEnabled) return createSuccessResponse('2FA Enabled');
      await this.set_token(userExists, res);
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
      await this.set_token(valid_token.user, res);
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
      await this.set_token(user, res);
      return createSuccessResponse('2FA Enabled');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error' }]);
    }
  }

  async google(code: string, res: Response) {
    try {
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://your-api.com/api/auth/google/callback',
      );
      const { tokens } = await client.getToken(code);
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload)
        return createErrorResponse([{ message: 'Invalid Google token' }]);

      const { sub, email, name } = payload as {
        sub: string;
        email: string;
        name: string;
      };
      var user = await this.prisma.user.findFirst({ where: { email } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            name: name || 'Google User',
            password: 'GOOGLE',
            status: 'ACTIVE',
          },
        });
      } else if (user?.is2FAEnabled)
        return createSuccessResponse('2FA Enabled');
      await this.set_token(user, res);
      return createSuccessResponse('Google login successful');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Google Error' }]);
    }
  }

  async reset_password(resetDto: LoginDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: resetDto.email },
      });
      if (!user)
        return createErrorResponse([{ message: 'User does not exist' }]);
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: resetDto.password,
        },
      });
      return createSuccessResponse('Password reset successfull');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error resetting password' }]);
    }
  }

  async set_token(
    user: { name: string; email: string; id: string; role: string },
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
        { sub: user.id, email: user.email, role: user.role },
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
}

async function send_mail(
  user: { email: string; name: string; status: string },
  nonce: string,
) {
  try {
    let mail, title;
    if (user.status == 'PENDING') {
      title = `Welcome to WealthWave, ${user.name}! Verify Your Email`;
      mail = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .header { background-color: #007bff; color: white; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; background-color: white; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .button:hover { background-color: #0056b3; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to WealthWave!</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>Thank you for registering with WealthWave! To complete your registration, please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="https://your-api.com/api/auth/verify?token=${nonce}" class="button">Verify Email</a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${process.env.CLIENT_URL}/api/auth/verify?token=${nonce}">${process.env.CLIENT_URL}/api/auth/verify?token=${nonce}</a></p>
          <p>This link expires in 24 hours.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 WealthWave. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
    } else {
      title = `Password Reset Request for WealthWave, ${user.name}`;
      mail = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .header { background-color: #007bff; color: white; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; background-color: white; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .button:hover { background-color: #0056b3; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>WealthWave Password Reset</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your WealthWave account password. Click the button below to set a new password:</p>
          <p style="text-align: center;">
            <a href="https://your-app.com/reset-password?token=${nonce}" class="button">Reset Password</a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${process.env.CLIENT_URL}/reset-password?token=${nonce}">${process.env.CLIENT_URL}/reset-password?token=${nonce}</a></p>
          <p>This link expires in 24 hours. If you didn’t request a password reset, please ignore this email or contact support.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 WealthWave. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
    }

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: title,
      html: mail,
    };
    await transporter.sendMail(mailOptions);
    return createSuccessResponse('Email sent successfully');
  } catch (error) {
    console.error(error);
    return createErrorResponse([{ message: 'Error sending mail' }]);
  }
}
