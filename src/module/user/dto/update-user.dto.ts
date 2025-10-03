import { IsBoolean, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name?: string;

  @IsBoolean()
  is2FAEnabled?: boolean;

  @IsString()
  role?: 'user' | 'admin' | 'family_admin';
}
