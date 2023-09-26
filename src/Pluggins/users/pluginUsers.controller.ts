import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/createUser.dto";
import { CreateUserResponseDto } from "./dto/createUserResponse.dto";
import { GetUsersByPluginIdResponseDto } from "./dto/getUsersResponse.dto";
import { PluginUsersService } from "./pluginsUsers.service";




@Controller()
@ApiTags('PluginsUsers')
export class PluginUsersController {
    constructor(private readonly pluginsEmailsService: PluginUsersService) { }




    @Post('plugins/users')
    @ApiOperation({ summary: 'Register a new user in Firestore' })
    @ApiCreatedResponse({ description: 'The user was created successfully', type: CreateUserResponseDto })
    @ApiBadRequestResponse({ description: 'Bad request, user already exists', type: BadRequestException })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async registerUser(
        @Body() createUserDto: CreateUserDto,
        @Query('pluginId') pluginId: string
    ): Promise<CreateUserResponseDto> {
        try {
            return await this.pluginsEmailsService.registerUser(createUserDto, pluginId);
        } catch (error) {
            console.error('Error registering the user:', error);
            throw new BadRequestException(`Error registering the user: ${error.message}`);
        }
    }




    @ApiOperation({ summary: 'Get users by plugin ID' })
    @ApiQuery({ name: 'pluginId', type: String, description: 'Plugin ID' })
    @ApiResponse({ status: 200, description: 'Success in retrieving users', type: GetUsersByPluginIdResponseDto })
    @ApiResponse({ status: 404, description: 'Plugin not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Get('plugins/users')
    async getUsersByPluginId(@Query('pluginId') pluginId: string): Promise<GetUsersByPluginIdResponseDto> {
        try {
            return this.pluginsEmailsService.getUsersByPluginId(pluginId);

        } catch (error) {
            console.error('Error getting users by pluginId:', error);
            throw new Error(`Error getting users by pluginId: ${error.message}`);
        }
    }




}