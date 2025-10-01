import { IsString, IsDecimal } from 'class-validator';
import { StringifyOptions } from 'querystring';

export class CreateGoalDto {
  @IsString()
  name: string;

  @IsDecimal()
  goal: number;

  @IsString()
  deadline: string;

  @IsDecimal()
  current: number;
}
