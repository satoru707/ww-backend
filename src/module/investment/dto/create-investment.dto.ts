import { IsDate, IsDecimal, IsString } from 'class-validator';

export class CreateInvestmentDto {
  @IsString()
  symbol: string;

  @IsDecimal()
  quantity: number;

  @IsDecimal()
  purchase_price: number;

  @IsDate()
  purchase_date: Date;
}
