import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

enum PromptType {
  FOR = 'FOR',
  IF = 'IF',
  NONE = 'NONE',
}

export class PromptInfo {
  @ApiProperty({
    description: 'ID of the prompt.',
    example: '8yyWg7lfpBX6uw3Vgyqp',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Type of the prompt.',
    example: 'FOR',
    enum: PromptType,
  })
  @IsEnum(PromptType)
  type: PromptType;
  @ApiProperty({
    description: 'Regular expression to be found in the prompt text.',
    example: ['\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'],
    required: false,
  })
  @IsOptional()
  regexp?: string[];
}

export class CreateSequenceDto {
  @ApiProperty({
    description: 'Name of the sequence.',
    example: 'Sequence 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the sequence.',
    example: 'This is a description for Sequence 1.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description:
      'List of prompts associated with the sequence, each including an ID and a type.',
    example: [
      { id: '8yyWg7lfpBX6uw3Vgyqp', type: 'FOR' },
      { id: 'B9Lkp2Ny4x89ldoxTxCn', type: 'IF' },
    ],
    type: [PromptInfo],
  })
  @IsArray()
  prompts: PromptInfo[];

  constructor(name: string, description: string, prompts: PromptInfo[]) {
    this.name = name;
    this.description = description;
    this.prompts = prompts;
  }
}
