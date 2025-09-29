import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsString, IsEnum } from 'class-validator';

enum roleProps {
  USER,
  ADMIN,
  FAMILY_ADMIN,
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  name?: string;

  @IsBoolean()
  is2FAEnabled?: boolean;

  @IsEnum(roleProps)
  role?: roleProps;
}

