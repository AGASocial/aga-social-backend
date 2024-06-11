import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AIParameters } from '../entities/aiParameters';

export class ExecutePromptDto {
  @ApiProperty({
    description: 'Parameters for the execution.',
    example: { NOMBRE: 'Alex', PROFESION: 'Medico' },
  })
  @IsOptional()
  parameters?: { [key: string]: any };

  @ApiProperty({
    description: 'AI parameters for the execution.',
    type: AIParameters,
    example: {
      model: 'gpt-3.5-turbo',
    },
  })
  @IsOptional()
  aiparameters?: AIParameters;

  constructor(aiparameters: AIParameters, parameters?: { [key: string]: any }) {
    this.aiparameters = aiparameters;
    this.parameters = parameters;
  }
}
