import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '../jwt.guard';
import { Roles } from '../role.decorator';
import { RolesGuard } from '../role.guard';

// create payment, get all, get one, connect third party payment api
@UseGuards(AuthGuard, RolesGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
}
