import { IsBoolean, IsString, IsEnum } from 'class-validator';

enum roleProps {
  USER,
  ADMIN,
  FAMILY_ADMIN,
}

export class UpdateUserDto {
  @IsString()
  name?: string;

  @IsBoolean()
  is2FAEnabled?: boolean;

  @IsEnum(roleProps)
  role?: roleProps;
}
