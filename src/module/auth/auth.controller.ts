import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() body: CreateAuthDto) {
    console.log('Register route');
    return this.authService.create(body);
  }

  @Post('login')
  login(@Body() body: LoginDto, @Res({ passthrough: true }) res) {
    return this.authService.login(body, res);
  }

  @Post('google')
  google(@Body() body: { code: string }, @Res({ passthrough: true }) res) {
    return this.authService.google(body.code, res);
  }

  @Get('refresh')
  refresh(@Res({ passthrough: true }) res) {
    return this.authService.refresh(res);
  }

  @Post('verify_2fa')
  auth(@Body() body: { user_email: string }, @Res({ passthrough: true }) res) {
    return this.authService.verify_2fa(body.user_email, res);
  }

  @Post('reset_password')
  reset(@Body() body: LoginDto) {
    return this.authService.reset_password(body);
  }
}
