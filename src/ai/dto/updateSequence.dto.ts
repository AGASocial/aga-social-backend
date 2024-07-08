import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PromptInfo } from './createSequence.dto';

export class UpdateSequenceDto {
  @ApiPropertyOptional({
    description: 'Name of the sequence.',
    example: 'Updated Sequence Name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the sequence.',
    example: 'This is an updated description for the sequence.',
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
  @IsOptional()
  prompts?: PromptInfo[];

  constructor(name?: string, description?: string, prompts?: PromptInfo[]) {
    this.name = name;
    this.description = description;
    this.prompts = prompts;
  }
}
