/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { Message } from '../entities/message';

export class CreatePromptDto {
  @ApiProperty({
    description: 'Array of messages.',
    example: [
      {
        role: 'user',
        content:
          '{{NOMBRE}} necesita ayuda profesional, su profesion es {{PROFESION}}',
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  messages: Message[];

  @ApiProperty({
    description: 'Owner of the prompt. It is the userId',
      example: '0EwINikFVAg7jtRdkZYiTBXN4vW2',
  })
  @IsNotEmpty()
  creator: string;

  @ApiProperty({
    description: 'Company associated with the prompt.',
    example: 'MyCompany',
  })
  @IsOptional()
  company?: string;

  @ApiProperty({
    description: 'App associated with the prompt.',
    example: 'MyApp',
  })
  @IsOptional()
  app?: string;

  @ApiProperty({
    description: 'Tags associated with the prompt.',
    example: ['tag1', 'tag2'],
  })
  @IsOptional()
  tags?: string[];

  constructor(
    messages: Message[],
    creator: string,
    company: string,
    app: string,
    tags: string[],
  ) {
    this.messages = messages;
    this.creator = creator;
    this.company = company;
    this.app = app;
    this.tags = tags;
  }
}
