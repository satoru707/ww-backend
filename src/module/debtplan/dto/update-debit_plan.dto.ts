import { PartialType } from '@nestjs/swagger';
import { CreatedeptplanDto } from './create-debit_plan.dto';

export class UpdatedeptplanDto extends PartialType(CreatedeptplanDto) {}
