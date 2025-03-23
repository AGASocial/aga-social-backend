import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentResponseDto {
  @ApiProperty({ description: 'Payment ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Payment status', example: 'succeeded' })
  status: string;

  @ApiProperty({ description: 'Order ID', example: 'ord_123456' })
  orderId: string;

  @ApiProperty({ description: 'Amount processed', example: 99.99 })
  amount: number;

  @ApiProperty({ description: 'Transaction timestamp', example: '2024-12-12T20:12:52-06:00' })
  createdAt: Date;
}
