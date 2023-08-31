import { Controller, Get, Post, Body, Request, Patch, Param, Delete, Req, Query, Put } from '@nestjs/common';
import { PlugginService } from './pluggin.service';
import { CreatePlugginDto, Install} from './dto/create-pluggin.dto';
import { UpdatePlugginDto } from './dto/update-pluggin.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FindOnePlugginDTO } from './dto/find-one-pluggin.dto';
import { FindPluginPayDTO } from './dto/Find-plugin-pay.dto';
@ApiTags('Plugins')
@Controller('plugins')
export class PlugginController {
  constructor(private readonly plugginService: PlugginService) { }
  @Get()
  findAll() {
    return this.plugginService.findAll();
  }
  @Get('ForSell')
  findAllForSell() {
    return this.plugginService.findAllForSell();
  }
  @Post()
  @ApiOkResponse({ schema: { example: { isAuthenticate: true, status: 200 } } })
  async create(@Req() req: Request, @Body() createPlugginDto: CreatePlugginDto) {
    return await this.plugginService.create(createPlugginDto);
  }
  @Get(':uid')
  async FindOnePlugginPay(@Req() req: Request, @Param('uid') uid: string) {
    return await this.plugginService.findOne(uid);
  }

  @Put(':uid')
  @ApiOkResponse({ schema: { example: { isAuthenticate: true, status: 200 } } })
  async update(@Req() req: Request, @Param('uid') name: string, @Body() UpdatePlugginDto: UpdatePlugginDto) {
    return await this.plugginService.update(name, UpdatePlugginDto);
  }
  @Put(':uid/activate')
  @ApiOkResponse({ schema: { example: { isAuthenticate: true, status: 200 } } })
  async activate(@Req() req: Request, @Param('uid') uid: string) {
    return await this.plugginService.activate(uid);
  }
  @Put(':uid/deactivate')
  @ApiOkResponse({ schema: { example: { isAuthenticate: true, status: 200 } } })
  async deactivate(@Req() req: Request, @Param('uid') uid: string) {
    return await this.plugginService.deactivate(uid);
  }
  @Delete(':uid')
  @ApiOkResponse({ schema: { example: { isAuthenticate: true, status: 200 } } })
  async delete(@Req() req: Request, @Param('uid') name: string) {
    return await this.plugginService.remove(name);
  }

  @Post('install/')
  install(@Body() install: Install) {
    return this.plugginService.Install(install.token, install.url);
  }
}
