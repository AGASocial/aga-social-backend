import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsArray, IsDate, IsInt, IsEnum } from "class-validator";
import { EbookFormat } from 'src/ebooks/entities/ebooks.entity';

export class DeleteEbookDto {
    @ApiProperty({
        description: 'Title of the ebook',
        example: 'Introduction to Programming',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    

    @ApiProperty({
        description: 'Price of the ebook',
        example: 19.99,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    


    @ApiProperty({
        description: 'Format of the ebook',
        example: 'PDF',
        enum: EbookFormat,
    })
    @IsNotEmpty()
    @IsEnum(EbookFormat)
    format: EbookFormat;
}
