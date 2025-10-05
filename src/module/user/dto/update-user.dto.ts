import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Name of the user' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Enable or disable 2FA for the user' })
  @IsOptional()
  @IsBoolean()
  is2FAEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Role of the user',
    enum: ['user', 'admin', 'family_admin'],
  })
  @IsOptional()
  @IsString()
  role?: 'user' | 'admin' | 'family_admin';
}
