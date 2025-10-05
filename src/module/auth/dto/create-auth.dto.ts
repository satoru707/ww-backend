import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nonce?: string;

  @IsOptional()
  @ApiPropertyOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  password: string;
}
