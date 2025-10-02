import { IsDecimal, IsString } from 'class-validator';

export class CreatedeptplanDto {
  @IsString()
  debt_name: string;

  @IsDecimal()
  amount: number;

  @IsDecimal()
  interest_rate: number;

  @IsString()
  strategy: 'SNOWBALL' | 'AVALANCHE';
}
