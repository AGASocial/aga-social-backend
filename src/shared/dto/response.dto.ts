import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject } from 'class-validator';

export class ResponseDto {
  @ApiProperty({ description: 'Status of the response.', example: 'success' })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'HTTP status code of the response.',
    example: 200,
  })
  @IsNumber()
  code: number;

  @ApiProperty({
    description: 'Message describing the response.',
    example: 'RequestSuccess',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Data returned by the response.',
    example: {},
  })
  @IsObject()
  data: {
    result: Record<string, any>;
  };

  constructor(
    status: string,
    code: number,
    message: string,
    result: Record<string, any>,
  ) {
    this.status = status;
    this.code = code;
    this.message = message;
    this.data = {
      result: result,
    };
  }
}
