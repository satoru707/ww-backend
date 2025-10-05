import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsNumber()
  amount: number;

  @IsString()
  date: string;

  @IsBoolean()
  is_recurring: boolean;

  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  familyId: string;

  @IsString()
  source: string;
}
