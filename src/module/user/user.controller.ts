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
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
@ApiSecurity('access_token')
@ApiSecurity('refresh_token')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('me')
  @Roles(['user', 'family_admin', 'admin'])
  @ApiOperation({
    summary: 'Get current user details',
    description: 'Retrieve the details of the currently authenticated user.',
  })
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
  find(@Res({ passthrough: true }) res: Response) {
    return this.userService.find(res);
  }

  @Patch('me')
  @Roles(['user', 'family_admin', 'admin'])
  @ApiOperation({
    summary: 'Update current user details',
    description: 'Update the details of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'The user details have been successfully updated.',
    schema: {
      example: {
        id: 'user-id',
        email: 'updated-email',
        name: 'updated-name',
        role: 'user-role',
        is2FAEnabled: true,
        familyId: 'family-id',
        status: 'active',
        createdAt: '2023-10-01T00:00:00.000Z',
        updatedAt: '2023-10-02T00:00:00.000Z',
        tokens: [],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    schema: {
      example: {
        statusCode: 400,
        errors: [{ message: 'Error updating user' }],
      },
    },
  })
  @ApiBody({
    description: 'Fields to update (name and/or role)',
    schema: {
      example: {
        name: 'new-name',
        role: 'new-role',
      },
    },
  })
  update(
    @Res({ passthrough: true }) res: Response,
    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(res, updateUserDto);
  }

  @Get()
  @Roles(['admin'])
  @ApiOperation({
    summary: 'Get all users (Admin only)',
    description: 'Retrieve a list of all users in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of users has been successfully retrieved.',
    schema: {
      example: {
        statusCode: 200,
        data: [
          {
            id: 'user-id-1',
            email: 'user1-email',
            name: 'user1-name',
            role: 'user1-role',
            is2FAEnabled: false,
            familyId: 'family-id-1',
            status: 'active',
            createdAt: '2023-10-01T00:00:00.000Z',
            updatedAt: '2023-10-01T00:00:00.000Z',
          },
          {
            id: 'user-id-2',
            email: 'user2-email',
            name: 'user2-name',
            role: 'user2-role',
            is2FAEnabled: true,
            familyId: 'family-id-2',
            status: 'active',
            createdAt: '2023-10-02T00:00:00.000Z',
            updatedAt: '2023-10-02T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    schema: {
      example: {
        statusCode: 400,
        errors: [{ message: 'Error fetching users' }],
      },
    },
  })
  findAll() {
    return this.userService.findAll();
  }

  @Roles(['user', 'family_admin'])
  @Delete()
  @ApiOperation({
    summary: 'Delete current user account',
    description:
      'Delete the account of the currently authenticated user. This action is irreversible.',
  })
  @ApiResponse({
    status: 200,
    description: 'The user account has been successfully deleted.',
    schema: {
      example: {
        statusCode: 200,
        data: null,
        message: 'User account deleted successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    schema: {
      example: {
        statusCode: 400,
        errors: [{ message: 'Error deleting user' }],
      },
    },
  })
  remove(@Res({ passthrough: true }) res) {
    return this.userService.remove(res);
  }

  @Roles(['user', 'family_admin'])
  @ApiOperation({
    summary: 'Enable two-factor authentication',
    description:
      'Enable two-factor authentication (2FA) for the current user. This will generate a QR code and secret key to set up 2FA in an authenticator app.',
  })
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
  @ApiOperation({
    summary: 'Export user data',
    description:
      'Export all data associated with the current user in JSON format.',
  })
  @ApiResponse({
    description: 'User data exported successfully.',

    schema: {
      example: {
        id: 'user-id',
        email: 'user-email',
        name: 'user-name',
        role: 'user-role',
        is2FAEnabled: true,
        familyId: 'family-id',
        status: 'active',
        createdAt: '2023-10-01T00:00:00.000Z',
        updatedAt: '2023-10-01T00:00:00.000Z',
        tokens: [],
        goals: [],
        family_as_admin: null,
        transactions: [],
      },
    },
  })
  @Get('export')
  exportUserData(@Res({ passthrough: true }) res) {
    return this.userService.exportUserData(res);
  }
}
