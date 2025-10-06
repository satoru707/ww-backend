import { IsNumber, IsString, IsEnum } from 'class-validator';

enum DebtStrategy {
  Avalanche = 'AVALANCHE',
  Snowball = 'SNOWBALL',
}

export class CreatedeptplanDto {
  @IsString()
  debt_name: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  interest_rate: number;

  @IsString()
  due_date: string;

  @IsEnum(DebtStrategy)
  strategy: DebtStrategy;
}
