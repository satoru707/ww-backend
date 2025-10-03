import { IsString, IsDecimal, IsDate, IsNumber } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  user_id?: string;

  @IsString()
  familyId?: string;

  @IsString()
  category: string;

  @IsNumber()
  limit_amount: number;

  //@IsDate()
  @IsString()
  month: Date;
}
