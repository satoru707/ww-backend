import { IsDate, IsString, IsNumber } from 'class-validator';

export class CreateInvestmentDto {
  @IsString()
  symbol: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  purchase_price: number;

  // @IsDate()
  @IsString()
  purchase_date: Date;
}
