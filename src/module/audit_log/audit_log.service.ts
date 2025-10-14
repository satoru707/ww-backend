import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAuditLogDto } from './dto/create-audit_log.dto';
import { ApiResponse, createSuccessResponse, createErrorResponse } from 'src/common/response.util';
import { Logs } from '../../services/mongo/logs.schema';
import { Model } from 'mongoose';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(Logs.name) private logsModel: Model<Logs>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<ApiResponse<any>> {
    try {
      await this.logsModel.create(createAuditLogDto);

      // If there's a userId, clear that user's specific logs cache including the user-aware cache key
      if (createAuditLogDto.userId) {
        await this.cacheManager.del(`${createAuditLogDto.userId}:/audit-log/${createAuditLogDto.userId}`);
      }
      // Clear the global logs cache including the user-aware cache key pattern
      const token = process.env.JWT_SECRET;
      if (token) {
        await this.cacheManager.del(`admin:/audit-log/all_logs`);
      }

      return createSuccessResponse('Log created successfully');
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : String(err));
      return createErrorResponse([{ message: 'Error creating audit log' }]);
    }
  }

  async findSome(id): Promise<ApiResponse<any>> {
    try {
      const logs = await this.logsModel.find({ userId: id });
      console.log('Logs', logs);
      return createSuccessResponse(logs);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : String(err));
      return createErrorResponse([{ message: 'Error finding logs' }]);
    }
  }

  async findAll(): Promise<ApiResponse<any>> {
    try {
      if (!process.env.JWT_SECRET) return createErrorResponse([{ message: 'Internal Server Error' }]);
      const logs = await this.logsModel.find();
      return createSuccessResponse(logs);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : String(err));
      return createErrorResponse([{ message: 'Error finding logs' }]);
    }
  }
}
