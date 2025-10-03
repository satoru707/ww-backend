import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Response,
} from '@nestjs/common';
import { FamilyService } from './family.service';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';

@Controller('family')
@UseGuards(AuthGuard, RolesGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @Roles(['family_admin'])
  create(@Body() body: { name: string }, @Response({ passthrough: true }) res) {
    return this.familyService.create(body.name, res);
  }

  @Roles(['family_admin'])
  @Get('add_member')
  add_member(
    @Body() body: { familyId: string; familyName: string; email: string },
  ) {
    return this.familyService.add_member(
      body.familyId,
      body.familyName,
      body.email,
    );
  }

  @Roles(['family_admin'])
  @Get('accept_family')
  accept_invite(@Param() param: { nonce: string }) {
    return this.familyService.accept_invite(param.nonce);
  }

  @Roles(['family_admin'])
  @Patch('edit_family')
  edit(@Body() body: { familyId: string; name: string }) {
    return this.familyService.edit_family(body.familyId, body.name);
  }

  @Roles(['family_admin', 'user'])
  @Delete('leave_family')
  leave(@Response({ passthrough: true }) res) {
    return this.familyService.leave(res);
  }

  @Roles(['family_admin', 'admin'])
  @Delete('delete_family')
  delete(@Param() param: { familyId?: string }) {
    return this.familyService.delete(param.familyId || '');
  }

  @Roles(['admin'])
  @Get('all_families')
  get_all() {
    return this.familyService.getAll();
  }
}
