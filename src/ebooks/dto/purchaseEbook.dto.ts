import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseEbookDto {
    @ApiProperty({
        description: 'User ID making the purchase',
        example: 'user123',
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'ID of the ebook being purchased',
        example: 'ebook456',
    })
    @IsNotEmpty()
    @IsString()
    ebookId: string;

    @ApiProperty({
        description: 'Payment Intent ID for the purchase',
        example: 'pi_123456789',
    })
    @IsNotEmpty()
    @IsString()
    paymentIntentId: string;
}
