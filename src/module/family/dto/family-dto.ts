import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFamilyDto {
  @ApiProperty({ example: 'My family', description: 'Name for family' })
  @IsString()
  name: string;
}

export class AddMemberDto {
  @ApiProperty({ example: 'family_id', description: 'Family id' })
  @IsString()
  familyId: string;

  @ApiProperty({ example: 'Family name', description: 'Family name' })
  @IsString()
  familyName: string;

  @ApiProperty({ example: 'email', description: 'User email' })
  @IsString()
  email: string;
}
