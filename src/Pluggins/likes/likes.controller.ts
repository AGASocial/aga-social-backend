import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}


  @Post()
  create(@Body() createLikeDto: CreateLikeDto) {
    return this.likesService.create(createLikeDto.url_domain,createLikeDto.element_id,createLikeDto.id_user);
  }
  @Get('domain/:url/element/:id_element')
  GetLikes(string,@Param('url') url: string,@Param('id_element') id_element: string ) {
    return this.likesService.GetLikes(url,id_element);
  }
  @Get('user/:user_id/domain/:url/element/:id_element')
  GetUserLikes(@Param('user_id') user_id: string,@Param('url') url: string,@Param('id_element') id_element: string ) {
    return this.likesService.UserLike(url,id_element,user_id);
  }
  @Delete()
  DeleteLike(@Body() createLikeDto: CreateLikeDto) {
    return this.likesService.DeleteLike(createLikeDto.url_domain,createLikeDto.element_id,createLikeDto.id_user);
  }

}
