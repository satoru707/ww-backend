import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a user account and sends a verification email.',
  })
  @ApiBody({ type: CreateAuthDto, description: 'User registration details' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully, verification email sent.',

    schema: { example: { data: null, message: 'Verify Email' } },
  })
  @ApiBadRequestResponse({
    description: 'User already exists.',

    schema: { example: { errors: [{ message: 'User already exists' }] } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error creating account or sending email.',

    schema: { example: { errors: [{ message: 'Error creating account' }] } },
  })
  create(@Body() body: CreateAuthDto) {
    console.log('Register route');
    return this.authService.create(body);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Log in a user',
    description: 'Authenticates a user, sets HTTP-only cookies (access_token, refresh_token), or prompts for 2FA.',
  })
  @ApiBody({ type: LoginDto, description: 'User login credentials' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, tokens set in cookies.',
    schema: { example: { data: null, message: 'Login successful' } },
  })
  @ApiResponse({
    status: 200,
    description: '2FA required for user with 2FA enabled.',
    schema: { example: { data: null, message: '2FA Enabled' } },
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials, user not found, or email not verified.',

    schema: {
      example: { errors: [{ message: 'Invalid Credentials or Login method' }] },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error logging in.',

    schema: { example: { errors: [{ message: 'Error logging in' }] } },
  })
  login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(body, res);
  }

  @Post('google')
  @ApiOperation({
    summary: 'Google OAuth login',
    description: 'Authenticates a user via Google OAuth, creates a user if new, and sets tokens or prompts for 2FA.',
  })
  @ApiBody({
    schema: { example: { code: 'your_google_oauth_code' } },
    description: 'Google OAuth authorization code',
  })
  @ApiResponse({
    status: 200,
    description: 'Google login successful, tokens set in cookies.',
    schema: { example: { data: null, message: 'Google login successful' } },
  })
  @ApiResponse({
    status: 200,
    description: '2FA required for user with 2FA enabled.',
    schema: { example: { data: null, message: '2FA Enabled' } },
  })
  @ApiBadRequestResponse({
    description: 'Invalid Google token.',

    schema: { example: { errors: [{ message: 'Invalid Google token' }] } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error during Google login.',

    schema: { example: { errors: [{ message: 'Google Error' }] } },
  })
  google(@Body() body: { code: string }, @Res({ passthrough: true }) res: Response) {
    return this.authService.google(body.code, res);
  }

  @Get('verify_email')
  @ApiOperation({
    summary: 'Verify email address',
    description: 'Verifies a user’s email using a nonce token sent via email.',
  })
  @ApiQuery({
    name: 'nonce',
    type: String,
    description: 'Email verification token',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
    schema: { example: { data: null, message: 'Email verified' } },
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired email link.',

    schema: { example: { errors: [{ message: 'Invalid email link' }] } },
  })
  confirm(@Query() query: { nonce: string }) {
    return this.authService.verify_email(query.nonce);
  }

  @Get('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refreshes the access token using a refresh token stored in cookies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully, new tokens set in cookies.',
    schema: { example: { data: null, message: 'Tokens refreshed' } },
  })
  @ApiUnauthorizedResponse({
    description: 'No or invalid refresh token.',

    schema: { example: { errors: [{ message: 'No refresh token' }] } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error refreshing tokens.',

    schema: {
      example: { errors: [{ message: 'Error returning access token' }] },
    },
  })
  refresh(@Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(res);
  }

  @Post('verify_2fa')
  @ApiOperation({
    summary: 'Verify 2FA code',
    description: 'Verifies a 2FA code for a user and sets tokens if valid.',
  })
  @ApiBody({
    schema: { example: { user_email: 'your_email', code: '123456' } },
    description: 'User email and 2FA code',
  })
  @ApiResponse({
    status: 200,
    description: '2FA verified, tokens set in cookies.',
    schema: { example: { data: null, message: '2FA Enabled' } },
  })
  @ApiBadRequestResponse({
    description: '2FA not enabled or invalid code.',

    schema: { example: { errors: [{ message: 'Invalid 2FA code' }] } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error verifying 2FA.',

    schema: { example: { errors: [{ message: 'Error' }] } },
  })
  verify2FA(@Body() body: { user_email: string; code: string }, @Res({ passthrough: true }) res: Response) {
    return this.authService.verify_2fa(body.user_email, body.code, res);
  }

  @Post('request_reset')
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset email with a reset link.',
  })
  @ApiBody({
    schema: { example: { email: 'user@example.com' } },
    description: 'User email for password reset',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent.',
    schema: { example: { data: null, message: 'Email sent' } },
  })
  @ApiBadRequestResponse({
    description: 'User does not exist.',

    schema: { example: { errors: [{ message: 'User does not exist' }] } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error sending reset email.',

    schema: { example: { errors: [{ message: 'Error requesting reset' }] } },
  })
  request(@Body() body: { email: string }) {
    return this.authService.request_reset(body.email);
  }

  @Post('reset_password')
  @ApiOperation({
    summary: 'Reset user password',
    description: 'Resets the user’s password using email and new password.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User email and new password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
    schema: { example: { data: null, message: 'Password reset successfull' } },
  })
  @ApiBadRequestResponse({
    description: 'User does not exist.',

    schema: { example: { errors: [{ message: 'User does not exist' }] } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error resetting password.',

    schema: { example: { errors: [{ message: 'Error resetting password' }] } },
  })
  reset(@Body() body: LoginDto) {
    return this.authService.reset_password(body);
  }

  @Get('logout')
  @ApiOperation({
    summary: 'Log out a user',
    description: 'Clears access and refresh tokens from cookies and deletes refresh token from database.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully.',
    schema: { example: { data: null, message: 'Logged out successfully' } },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error logging out.',

    schema: { example: { errors: [{ message: 'Error logging out' }] } },
  })
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
