import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FamilyService } from './family.service';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';
import { CreateFamilyDto, AddMemberDto } from './dto/family-dto';
import {
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import type { Response } from 'express';

@Controller('family')
@ApiSecurity('access_token')
@ApiSecurity('refresh_token')
@UseGuards(AuthGuard, RolesGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Roles(['family_admin', 'user'])
  @ApiOperation({
    summary: 'Get family details of the authenticated user',
    description:
      'Returns the family details including members if the user belongs to a family.',
  })
  @ApiResponse({
    status: 200,
    description: 'Family details retrieved successfully.',
    schema: {
      example: {
        id: 'familyId',
        name: 'Family Name',
        admin_id: 'adminUserId',
        members: [
          { id: 'memberId', name: 'Member Name', email: ' Member Email' },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'User has no family or other error.',
    schema: { example: { errors: [{ message: 'User has no family' }] } },
  })
  @Get()
  get_family(@Res({ passthrough: true }) res: Response) {
    return this.familyService.get_family(res);
  }

  @ApiOperation({
    summary: 'Create a new family',
    description:
      'Allows a user with the family_admin role to create a new family.',
  })
  @ApiBody({ type: CreateFamilyDto, description: 'Family creation details' })
  @ApiResponse({
    status: 200,
    description: 'Family created successfully.',
    schema: {
      example: { id: 'familyId', name: 'Family Name', admin_id: 'adminId' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error creating family.',
    schema: { example: { errors: [{ message: 'Error creating family' }] } },
  })
  @Roles(['family_admin'])
  @Post()
  create(
    @Body() body: CreateFamilyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.familyService.create(body.name, res);
  }

  @ApiOperation({
    summary: 'Add a member to the family',
    description:
      'Sends an invitation to the specified email to join the family.',
  })
  @ApiBody({ type: AddMemberDto })
  @ApiResponse({
    status: 200,
    description: 'Invitation sent successfully.',
    schema: {
      example: { message: 'Invitation sent to email' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error sending invitation.',
    schema: { example: { errors: [{ message: 'Error creating invite' }] } },
  })
  @Roles(['family_admin'])
  @Post('add_member')
  add_member(@Body() body: AddMemberDto) {
    return this.familyService.add_member(
      body.familyId,
      body.familyName,
      body.email,
    );
  }

  @ApiOperation({
    summary: 'Accept a family invitation',
    description:
      'Accepts the family invitation using the provided nonce token.',
  })
  @ApiParam({ name: 'nonce', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully.',
    schema: {
      example: { message: 'Successfully joined family' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error accepting invitation.',
    schema: { example: { errors: [{ message: 'Error accepting invite' }] } },
  })
  @Roles(['user'])
  @Get('accept_family/:nonce')
  accept_invite(@Param() param: { nonce: string }) {
    return this.familyService.accept_invite(param.nonce);
  }

  @ApiOperation({
    summary: 'Edit family details',
    description: 'Allows the family admin to edit the family name.',
  })
  @ApiBody({
    schema: { example: { familyId: 'familyId', name: 'New Family Name' } },
  })
  @ApiResponse({
    status: 200,
    description: 'Family details updated successfully.',
    schema: {
      example: { id: 'familyId', name: 'New Family Name', admin_id: 'adminId' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error updating family details.',
    schema: { example: { errors: [{ message: 'Error editing family' }] } },
  })
  @Roles(['family_admin'])
  @Patch('edit_family')
  edit(@Body() body: { familyId: string; name: string }) {
    return this.familyService.edit_family(body.familyId, body.name);
  }

  @ApiOperation({
    summary: 'Leave the family',
    description: 'Allows a user to leave their current family.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully left the family.',
    schema: {
      example: { message: 'Successfully left family' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error leaving the family.',
    schema: { example: { errors: [{ message: 'Error leaving family' }] } },
  })
  @Roles(['family_admin', 'user'])
  @Delete('leave_family')
  leave(@Res({ passthrough: true }) res) {
    return this.familyService.leave(res);
  }

  @ApiOperation({
    summary: 'Delete a family',
    description: 'Allows the admin to delete a family.',
  })
  @ApiResponse({
    status: 200,
    description: 'Family deleted successfully.',
    schema: {
      example: { message: 'Family deleted successfully' },
    },
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Family ID' })
  @ApiBadRequestResponse({
    description: 'Error deleting the family.',
    schema: { example: { errors: [{ message: 'Error deleting family' }] } },
  })
  @Roles(['family_admin'])
  @Delete('delete_family/:id')
  delete(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    return this.familyService.delete(res, id);
  }

  @ApiOperation({
    summary: 'Get all families (Admin only)',
    description: 'Allows an admin to retrieve a list of all families.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all families retrieved successfully.',
    schema: {
      example: [
        { id: 'familyId1', name: 'Family Name 1', admin_id: 'adminId1' },
        { id: 'familyId2', name: 'Family Name 2', admin_id: 'adminId2' },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Error retrieving families.',
    schema: { example: { errors: [{ message: 'Error retrieving families' }] } },
  })
  @Roles(['admin'])
  @Get('all_families')
  get_all() {
    return this.familyService.getAll();
  }
}
