import { IsString, IsDecimal, IsDate } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  user_id?: string;

  @IsString()
  familyId?: string;

  @IsString()
  category: string;

  @IsDecimal()
  limit_amount: number;

  @IsDate()
  month: string;
}
