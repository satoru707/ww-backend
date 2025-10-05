import { IsString, IsNumber } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  name: string;

  @IsNumber()
  target_amount: number;

  @IsNumber()
  current_amount: number;

  @IsString()
  deadline: string;
}
