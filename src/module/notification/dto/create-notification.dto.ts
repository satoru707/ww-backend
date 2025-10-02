import { IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  type: 'EMAIL' | 'PUSH';

  @IsString()
  message: string;
}
