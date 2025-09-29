import { Controller, Get, Post, Body, Res, Param } from '@nestjs/common';
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

  // for confirmation email just click link
  // for reset.first confirm if can reset before showing ui
  @Get('verify_email')
  confirm(@Param() param: { nonce: string }) {
    return this.authService.verify_email(param.nonce);
  }

  @Get('refresh')
  refresh(@Res({ passthrough: true }) res) {
    return this.authService.refresh(res);
  }

  @Post('verify_2fa')
  auth(@Body() body: { user_email: string }, @Res({ passthrough: true }) res) {
    return this.authService.verify_2fa(body.user_email, res);
  }

  @Post('request_reset')
  request(@Body() body: { email: string }) {
    return this.authService.request_reset(body.email);
  }

  @Post('reset_password')
  reset(@Body() body: LoginDto) {
    return this.authService.reset_password(body);
  }
}
