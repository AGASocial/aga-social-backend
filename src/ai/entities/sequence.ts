import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class Sequence {
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
    description: 'List of prompt IDs associated with the sequence.',
    example: ['8yyWg7lfpBX6uw3Vgyqp', 'B9Lkp2Ny4x89ldoxTxCn'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  prompts: string[];

  constructor(name: string, description: string, prompts: string[]) {
    this.name = name;
    this.description = description;
    this.prompts = prompts;
  }
}
