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
import { sign, verify } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import { jwtPayload } from 'src/types/types';
import { AuditLogService } from '../audit_log/audit_log.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private logs: AuditLogService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    try {
      const hashed = await bcrypt.hash(createAuthDto.password, 10);
      const userExists = await this.prisma.user.findFirst({
        where: { email: createAuthDto.email },
      });
      if (userExists) {
        await this.logs.create({
          userId: createAuthDto.email,
          actionType: 'USER_SIGNUP',
          level: 'ERROR',
          details: JSON.stringify('User already exists'),
        });
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
      const sent = await this.send_mail(user, nonce);
      if (sent.errors) {
        await this.logs.create({
          userId: user.id,
          actionType: 'USER_SIGNUP',
          level: 'ERROR',
          details: JSON.stringify(sent.errors[0].message),
        });
        return createErrorResponse([{ message: sent.errors[0].message }]);
      }
      await this.prisma.token.create({
        data: {
          user_id: user.id,
          token: nonce,
          type: 'CONFIRMATION',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      await this.logs.create({
        userId: user.id,
        actionType: 'SIGNUP',
        level: 'INFO',
        details: JSON.stringify(createAuthDto),
      });
      return createSuccessResponse('Verify Email');
    } catch (error) {
      console.error(error);
      await this.logs.create({
        actionType: 'USER_SIGNUP',
        level: 'ERROR',
        details: JSON.stringify(error.message),
        userId: createAuthDto.email,
      });
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
      const pass = await bcrypt.compare(
        checkAuthDto.password,
        userExists.password,
      );
      if (!pass)
        return createErrorResponse([
          { message: 'Invalid Credentials or Login method' },
        ]);
      if (userExists.status == 'PENDING') {
        const sent = await this.send_mail(
          userExists,
          userExists.tokens[0].token,
        );
        if (sent.errors)
          return createErrorResponse([{ message: sent.errors[0].message }]);

        return createErrorResponse([{ message: 'Email not verified' }]);
      }

      if (userExists.is2FAEnabled) return createSuccessResponse('2FA Enabled');
      await this.set_token(userExists, res);
      return createSuccessResponse('Login successful');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error logging in' }]);
    }
  }

  async logout(res: Response) {
    try {
      const token = res.req.cookies.access_token;
      if (token) {
        if (process.env.JWT_SECRET) {
          const decoded = verify(token, process.env.JWT_SECRET) as jwtPayload;
          await this.prisma.token.delete({
            where: { user_id_type: { user_id: decoded.sub, type: 'REFRESH' } },
          });
        }
      }
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return createSuccessResponse('Logged out successfully');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error logging out' }]);
    }
  }

  async verify_email(nonce: string) {
    try {
      const token_exists = await this.prisma.token.findFirst({
        where: { token: nonce },
      });
      if (!token_exists)
        return createErrorResponse([{ message: 'Invalid email link' }]);
      if (token_exists.expiresAt < new Date())
        return createErrorResponse([{ message: 'Invalid email link' }]);
      if (token_exists.user_id) {
        await this.prisma.user.update({
          where: { id: token_exists.user_id },
          data: { status: 'ACTIVE' },
        });
      }
      await this.prisma.token.delete({
        where: {
          id: token_exists.id,
        },
      });
      return createSuccessResponse('Email verified');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Invalid email link' }]);
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
      if (!valid_token || valid_token.user == null)
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

  async enable_two_factor_auth(res: Response) {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Server Error' }]);
      console.log(res.req.cookies.access_token);
      const token = verify(
        res.req.cookies.access_token,
        process.env.JWT_SECRET,
      ) as jwtPayload;
      const user_id = token.sub;
      const user = await this.prisma.user.findFirst({
        where: { id: user_id },
      });
      console.log('Found user');
      if (!user)
        return createErrorResponse([{ message: 'User does not exist' }]);
      const secret = speakeasy.generateSecret({
        length: 25,
        name: `Wealth Wave ${user.email}`,
      });
      await this.prisma.user.update({
        where: { id: user_id },
        data: { is2FAEnabled: true, two_factor_secret: secret.base32 },
      });
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      return createSuccessResponse(qrCodeUrl);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error enabling 2FA' }]);
    }
  }
  // the response for only res and res.req.cookie apparentenly
  async verify_2fa(user_email: string, code: string, res: Response) {
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
        token: code,
      });
      if (!verified) {
        return createErrorResponse([{ message: 'Invalid 2FA code' }]);
      }
      await this.set_token(user, res);
      return createSuccessResponse('Login successful');
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

  async request_reset(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email },
      });
      if (!user)
        return createErrorResponse([{ message: 'User does not exist' }]);
      const nonce = crypto.randomBytes(32).toString('hex');
      await this.prisma.token.create({
        data: {
          token: nonce,
          type: 'RESET',
          user_id: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      await this.send_mail(user, nonce);
      return createSuccessResponse('Email sent');
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error requesting reset' }]);
    }
  }

  async reset_password(resetDto: LoginDto) {
    try {
      const token = await this.prisma.token.findFirst({
        where: { token: resetDto.nonce, type: 'RESET' },
      });
      if (!token)
        return createErrorResponse([{ message: 'User does not exist' }]);
      await this.prisma.token.deleteMany({
        where: {
          user_id: token.user_id,
          type: 'RESET',
        },
      });
      if (token.user_id) {
        await this.prisma.user.update({
          where: {
            id: token.user_id,
          },
          data: {
            password: resetDto.password,
            updatedAt: new Date(),
          },
        });
      }

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
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const jwt_token = sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
      );
      console.log('access', jwt_token);
      console.log('refresh', nonce);
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

  async send_mail(
    user: { email: string; name: string; status: string; family_name?: string },
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
            <a href="https://your-api.com/auth/verify?token=${nonce}" class="button">Verify Email</a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${process.env.CLIENT_URL}/auth/verify?token=${nonce}">${process.env.CLIENT_URL}/auth/verify?token=${nonce}</a></p>
          <p>This link expires in 24 hours.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 WealthWave. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
      } else if (user.status == 'FAMILY') {
        title = `You're invited to join the ${user.family_name} Family on WealthWave!`;
        mail = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
      .header { background-color: #28a745; color: white; text-align: center; padding: 20px; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { padding: 20px; background-color: white; border-radius: 5px; }
      .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
      .button:hover { background-color: #218838; }
      .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Join Your Family on WealthWave</h1>
      </div>
      <div class="content">
        <p>Hi ${user.name},</p>
        <p>The <strong>${user.family_name}</strong> family has invited you to join their WealthWave household. Together, you can manage budgets, track goals, and make smarter financial decisions as a family unit.</p>
        <p style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/family/join?token=${nonce}" class="button">Accept Invitation</a>
        </p>
        <p>If the button doesn’t work, copy and paste this link into your browser:</p>
        <p><a href="${process.env.CLIENT_URL}/family/join?token=${nonce}">${process.env.CLIENT_URL}/family/join?token=${nonce}</a></p>
        <p>This invitation will expire in 24 hours. If you weren’t expecting this invitation, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; 2025 WealthWave. Empowering families to grow wealth together.</p>
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
}

