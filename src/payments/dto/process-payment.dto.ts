import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsObject, ValidateNested, Min, Max, Length, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreditCardDto {
  @ApiProperty({ description: 'Credit card number', example: '4111111111111111' })
  @IsString()
  @Length(13, 19)
  @Matches(/^[0-9]+$/)
  cardNumber: string;

  @ApiProperty({ description: 'Expiration month (1-12)', example: 12 })
  @IsNumber()
  @Min(1)
  @Max(12)
  expirationMonth: number;

  @ApiProperty({ description: 'Expiration year (YYYY)', example: 2025 })
  @IsNumber()
  @Min(2024)
  expirationYear: number;

  @ApiProperty({ description: 'CVV security code', example: '123' })
  @IsString()
  @Length(3, 4)
  @Matches(/^[0-9]+$/)
  cvv: string;

  @ApiProperty({ description: 'Name as it appears on the card', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  cardholderName: string;
}

export class AddressDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State (2-letter code)', example: 'NY' })
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/)
  state: string;

  @ApiProperty({ description: 'ZIP code', example: '10001' })
  @IsString()
  @Matches(/^\d{5}(-\d{4})?$/)
  zipCode: string;

  @ApiProperty({ description: 'Country', example: 'USA' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Payment amount in USD', example: 99.99 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Payment gateway', example: 'PayPal' })
  @IsString()
  @IsNotEmpty()
  gateway: string;

  @ApiProperty({ description: 'Credit card information' })
  @IsObject()
  @ValidateNested()
  @Type(() => CreditCardDto)
  creditCard: CreditCardDto;

  @ApiProperty({ description: 'Billing address' })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @ApiProperty({ description: 'Order ID', example: 'ord_123456' })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
