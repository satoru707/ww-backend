import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAuditLogDto } from './dto/create-audit_log.dto';
import {
  ApiResponse,
  createSuccessResponse,
  createErrorResponse,
} from 'src/common/response.util';
import { Logs } from '../../services/mongo/logs.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuditLogService {
  constructor(@InjectModel(Logs.name) private logsModel: Model<Logs>) {}

  async create(
    createAuditLogDto: CreateAuditLogDto,
  ): Promise<ApiResponse<any>> {
    try {
      await this.logsModel.create(createAuditLogDto);
      return createSuccessResponse('Log created successfully');
    } catch (error) {
      console.log(error);
      return createErrorResponse([{ message: 'Error creating audit log' }]);
    }
  }

  async findSome(id): Promise<ApiResponse<any>> {
    try {
      const logs = await this.logsModel.find({ userId: id });
      console.log('Logs', logs);
      return createSuccessResponse(logs);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error finding logs' }]);
    }
  }

  async findAll(): Promise<ApiResponse<any>> {
    try {
      if (!process.env.JWT_SECRET)
        return createErrorResponse([{ message: 'Internal Server Error' }]);
      const logs = await this.logsModel.find();
      return createSuccessResponse(logs);
    } catch (error) {
      console.error(error);
      return createErrorResponse([{ message: 'Error finding logs' }]);
    }
  }
}
