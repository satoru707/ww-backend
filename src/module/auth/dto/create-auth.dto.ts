import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;
}

export class LoginDto {
  @IsString()
  nonce?: string;

  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  password: string;
}
