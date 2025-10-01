import { IsString, IsDecimal, IsBoolean } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsDecimal()
  amount: number;

  @IsString()
  date: string;

  @IsBoolean()
  is_recurring: boolean;

  @IsString()
  familyId: string;

  @IsString()
  source: string;
}
