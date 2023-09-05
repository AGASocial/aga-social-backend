import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseCourseDto {
    @ApiProperty({
        description: 'User ID making the purchase',
        example: 'user123',
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'ID of the course being purchased',
        example: 'course789',
    })
    @IsNotEmpty()
    @IsString()
    courseId: string;

    @ApiProperty({
        description: 'Payment Intent ID for the purchase',
        example: 'pi_987654321',
    })
    @IsNotEmpty()
    @IsString()
    paymentIntentId: string;
}
