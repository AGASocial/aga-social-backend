import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class Message {
  @ApiProperty({ description: 'Role of the message sender.', example: 'user' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['user', 'system', 'assistant'])
  role: string;

  @ApiProperty({
    description: 'Content of the message.',
    example:
      '{{NOMBRE}} es {{PROFESION}} con {{EDAD}}, y necesita ayuda profesional',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
