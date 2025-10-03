import { IsString, IsDecimal, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBudgetDto {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  user_id?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  familyId?: string;

  @IsString()
  category: string;

  @IsNumber()
  limit_amount: number;

  // @IsDate()
  @IsString()
  month: Date;
}
