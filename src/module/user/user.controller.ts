import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import type { Response } from 'express';

class ErrorResponse {
  errors: { message: string }[];
}

class SuccessResponse {
  data: any;
  message: string | null;
}

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('me')
  @Roles(['user', 'family_admin', 'admin'])
  @ApiOperation({ summary: 'Get current user details' })
  @ApiResponse({
    status: 200,
    description: 'The user details have been successfully retrieved.',

    schema: {
      example: {
        id: 'user-id',
        email: 'user-email',
        name: 'user-name',
        role: 'user-role',
        is2FAEnabled: false,
        familyId: 'family-id',
        status: 'active',
        createdAt: '2023-10-01T00:00:00.000Z',
        updatedAt: '2023-10-01T00:00:00.000Z',
        tokens: [],
        goals: [],
        family_as_admin: null,
        family: [],
        transactions: [],
        budgets: [],
        investments: [],
        payments: [],
        debt_plans: [],
        notifications: [],
        audit_logs: [],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',

    schema: {
      example: {
        statusCode: 400,
        errors: [{ message: 'Error returning user' }],
      },
    },
  })
  find(@Res({ passthrough: true }) res) {
    return this.userService.find(res);
  }

  @Patch('me')
  @Roles(['user', 'family_admin', 'admin'])
  update(
    @Res({ passthrough: true }) res,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(res, updateUserDto);
  }

  @Get()
  @Roles(['admin'])
  findAll() {
    return this.userService.findAll();
  }

  @Roles(['admin', 'user', 'family_admin'])
  @Delete(':id')
  remove(@Param('id') params: { id: string }, @Res({ passthrough: true }) res) {
    return this.userService.remove(params.id, res);
  }

  @Roles(['user', 'family_admin'])
  @ApiSecurity('access_token')
  @ApiSecurity('refresh_token')
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({
    description: 'Two-factor authentication enabled successfully.',

    schema: {
      example: {
        statusCode: 200,
        data: {
          qrCodeUrl: 'data:image/png;base64,iVBORw0K...',
          secret: 'JBSWY3DPEHPK3PXP',
        },
        message: 'Two-factor authentication enabled successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error enabling 2FA',
    schema: {
      example: {
        statusCode: 400,
        errors: [{ message: 'Error enabling 2FA' }],
      },
    },
  })
  @Get('/enable_2fa')
  enable(@Res({ passthrough: true }) res) {
    return this.authService.enable_two_factor_auth(res);
  }

  @Roles(['user', 'family_admin'])
  @Get('export')
  exportUserData(@Res({ passthrough: true }) res) {
    return this.userService.exportUserData(res);
  }
}
