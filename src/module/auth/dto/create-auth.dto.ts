import { IsString, IsEmail, MinLength } from 'class-validator';

// dto is for inputs
export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;
}
