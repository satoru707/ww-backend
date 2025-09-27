import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';

// auth with third party, two factor auth, password reset
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    console.log('Register route');
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  login(
    @Body() checkAuthDto: { email: string; password: string },
    @Res({ passthrough: true }) res,
  ) {
    return this.authService.login(checkAuthDto, res);
  }

  @Get('refresh')
  refresh(@Res({ passthrough: true }) res) {
    return this.authService.refresh(res);
  }

  @Post('verify_2fa')
  auth(@Body() user_email: string, @Res({ passthrough: true }) res) {
    return this.authService.verify_2fa(user_email, res);
  }
}
