import { Controller,Patch,Delete, Get, Post, Put, UseGuards, Request, Req, BadRequestException, UnauthorizedException, HttpStatus, Body, Header, Query, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiOkResponse, ApiHeader, ApiHeaders } from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto,FindTodoDTO} from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
@ApiTags('Todos')
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) { }

  @Post()
  @UseGuards(AuthGuard('firebase-jwt'))
  @ApiBearerAuth()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Post('user')
  findAll(@Body() findTodoDTO: FindTodoDTO) {
    return this.todoService.findAll(findTodoDTO.client_uid, findTodoDTO.url);
  }

  @Patch(':id')
  CheckTodo(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.CheckTodo(id, updateTodoDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoService.remove(id);
  }
}
