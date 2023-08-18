import { Controller,Patch,Delete, Get, Post, Put, UseGuards, Request, Req, BadRequestException, UnauthorizedException, HttpStatus, Body, Header, Query, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiOkResponse, ApiHeader, ApiHeaders } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto, FindNoteDTO } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { util } from 'prettier';
@ApiTags('Notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) { }

  @Post()
  @UseGuards(AuthGuard('firebase-jwt'))
  @ApiBearerAuth()
  public async create(@Req() req: Request, @Body() createNoteDto: CreateNoteDto): Promise<any> {
    return this.notesService.create(createNoteDto);
  }

  @Post('user/')
  findOne(@Body() findNoteDTO: FindNoteDTO) {
    return this.notesService.findOne(findNoteDTO.client_uid, findNoteDTO.url);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }

}
