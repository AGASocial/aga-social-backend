import { PartialType } from '@nestjs/swagger';
import { CreateTodoDto } from './create-todo.dto';
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, IsBoolean } from "class-validator";
export class UpdateTodoDto {
    @ApiProperty({ description: 'done' })
    @IsBoolean()
    done: boolean;
}
