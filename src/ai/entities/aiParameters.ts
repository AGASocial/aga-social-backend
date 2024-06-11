import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';

export class AIParameters {
  @ApiProperty({
    description: 'Model to use for text generation.',
    example: 'text-davinci-002',
  })
  @IsString()
  model: string;

  @ApiProperty({
    description: 'Adjusts the likelihood of frequency penalties.',
    example: 0.5,
  })
  @IsOptional()
  @IsNumber()
  frequency_penalty?: number;

  @ApiProperty({
    description: 'Adjusts the bias of the logits before sampling.',
    example: { trumpet: -100 },
  })
  @IsOptional()
  logit_bias?: any;

  @ApiProperty({ description: 'Include the log probabilities.', example: true })
  @IsOptional()
  @IsBoolean()
  logprobs?: boolean;

  @ApiProperty({
    description: 'Include the top log probabilities.',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  top_logprobs?: number;

  @ApiProperty({
    description: 'The maximum number of tokens to generate.',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  max_tokens?: number;

  @ApiProperty({
    description: 'The number of completions to generate.',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  n?: number;

  @ApiProperty({
    description: 'Adjusts the likelihood of presence penalties.',
    example: 0.5,
  })
  @IsOptional()
  @IsNumber()
  presence_penalty?: number;

  @ApiProperty({ description: 'The format of the response.', example: 'text' })
  @IsOptional()
  response_format?: any;

  @ApiProperty({
    description: 'A seed to use for the random number generator.',
    example: 42,
  })
  @IsOptional()
  @IsNumber()
  seed?: number;

  @ApiProperty({
    description:
      'One or more tokens at which to stop generating further tokens.',
    example: ['\n'],
  })
  @IsOptional()
  stop?: any;

  @ApiProperty({
    description: 'Whether to stream back the output as it is being generated.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @ApiProperty({ description: 'Controls randomness.', example: 0.8 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({
    description: 'Controls diversity via nucleus sampling.',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  top_p?: number;

  @ApiProperty({
    description: 'Additional tools to use.',
    example: 'spell-checker',
  })
  @IsOptional()
  tools?: any;

  @ApiProperty({ description: 'Choice of tool to use.', example: 'first' })
  @IsOptional()
  tool_choice?: any;

  @ApiProperty({
    description: 'The user for whom the model is generating text.',
    example: 'user123',
  })
  @IsOptional()
  @IsString()
  user?: string;

  @ApiProperty({ description: 'Name of the assistant.', example: 'Assistant1' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Description of the assistant.',
    example: 'This is a test assistant.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Instructions for the assistant.',
    example: 'Generate a short story.',
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({
    description: 'Tool resources for the assistant.',
    example: { dictionary: 'English' },
  })
  @IsOptional()
  tool_resources?: any;

  @ApiProperty({
    description: 'Metadata for the assistant.',
    example: { version: '1.0' },
  })
  @IsOptional()
  metadata?: any;

  constructor(model: string) {
    this.model = model;
  }
}
