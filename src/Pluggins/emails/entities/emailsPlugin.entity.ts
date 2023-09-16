import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EmailsPlugin {
  
    @ApiProperty({
        description: 'List of email addresses',
        example: ['email1@example.com', 'email2@example.com'],
        type: [String],
    }) 
    @IsNotEmpty()
    @IsString({ each: true })
    emailList: string[];

   
}
