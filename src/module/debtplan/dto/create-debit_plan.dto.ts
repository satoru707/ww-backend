import { IsString } from 'class-validator';

export class CreatedeptplanDto {
  @IsString()
  debt_name: string;

  @IsString()
  amount: number;

  @IsString()
  interest_rate: number;

  @IsString()
  strategy: 'SNOWBALL' | 'AVALANCHE';
}
