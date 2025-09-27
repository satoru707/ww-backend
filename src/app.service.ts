import { Injectable } from '@nestjs/common';
import { createSuccessResponse } from './common/response.util';

@Injectable()
export class AppService {
  getHealth() {
    return createSuccessResponse('Server is active');
  }
}
