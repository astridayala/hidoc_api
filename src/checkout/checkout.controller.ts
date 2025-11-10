// src/checkout/checkout.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutConsultationDto } from './dtos/checkout-consultation.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('checkout')
@Controller('v1/checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post('consultation')
  @ApiOperation({ summary: 'Checkout para consulta médica (compat con tabla payment minimal)' })
  async consultation(@Body() body: CheckoutConsultationDto) {
    return this.checkout.checkoutConsultation(body);
  }
}