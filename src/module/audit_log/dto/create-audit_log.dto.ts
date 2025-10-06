import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

// copy exactly from mongo.schema
export class CreateAuditLogDto {
  @IsString()
  actionType: string;

  @IsString()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  familyId?: string;

  @IsString()
  details: string;

  @IsString()
  level: 'INFO' | 'ERROR';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAgent?: string;
}
