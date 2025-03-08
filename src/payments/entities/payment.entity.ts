import { IsNotEmpty, IsString, IsNumber, IsDate, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreditCardInfo {
  @ApiProperty({
    description: 'Masked credit card number',
    example: '****-****-****-1234'
  })
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty({
    description: 'Expiration month',
    example: 12
  })
  @IsNumber()
  @IsNotEmpty()
  expirationMonth: number;

  @ApiProperty({
    description: 'Expiration year',
    example: 2025
  })
  @IsNumber()
  @IsNotEmpty()
  expirationYear: number;

  @ApiProperty({
    description: 'Card holder name',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  cardholderName: string;
}

export class BillingAddressInfo {
  @ApiProperty({
    description: 'Street address',
    example: '123 Main St'
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    description: 'City',
    example: 'New York'
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State',
    example: 'NY'
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'ZIP code',
    example: '10001'
  })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA'
  })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class Payment {

  @ApiProperty({
    description: 'Payment ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 99.99
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Order ID',
    example: 'ord_123456'
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'succeeded'
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'Credit card information'
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CreditCardInfo)
  creditCard: CreditCardInfo;

  @ApiProperty({
    description: 'Billing address'
  })
  @IsObject()
  @ValidateNested()
  @Type(() => BillingAddressInfo)
  billingAddress: BillingAddressInfo;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-12-12T20:15:42-06:00'
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-12-12T20:15:42-06:00'
  })
  @IsDate()
  updatedAt: Date;
}
