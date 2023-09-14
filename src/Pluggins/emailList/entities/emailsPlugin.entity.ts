import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EmailsPlugin {
    @ApiProperty({
        description: 'Firestore ID of the emailsPlugin',
        example: 'emails-abcdef123456',
        type: String,
    })
    id: string;

    @ApiProperty({
        description: 'List of email addresses',
        example: ['email1@example.com', 'email2@example.com'],
        type: [String],
    })
    @IsNotEmpty()
    @IsString({ each: true })
    emailList: string[];

    @ApiProperty({
        description: 'Domain associated with the email list',
        example: 'example.com',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    domain: string;

    @ApiProperty({
        description: 'Owner (User) of the emailsPlugin',
        type: String,
    })
    owner: string; 
}
