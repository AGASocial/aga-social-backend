import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Message } from '../entities/message';

export class UpdatePromptDto {
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
  @IsOptional()
  messages?: Message[];

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
    company: string,
    app: string,
    tags: string[],
  ) {
    this.messages = messages;
    this.company = company;
    this.app = app;
    this.tags = tags;
  }
}
