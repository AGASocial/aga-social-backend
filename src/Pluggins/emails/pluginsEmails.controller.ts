import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateEmailResponseDto } from "./dto/createEmailResponse.dto";
import { CreatePluginResponseDto } from "./dto/createPluginResponse.dto";
import { CreateUserDto } from "./dto/createUser.dto";
import { CreateUserResponseDto } from "./dto/createUserResponse.dto";
import { GetEmailsResponseDto } from "./dto/getEmailsResponse.dto";
import { GetUsersByPluginIdResponseDto } from "./dto/getUsersResponse.dto";
import { EmailsService } from "./pluginEmails.service";





@Controller()
@ApiTags('PluginsEmails')
export class EmailsController {
    constructor(private readonly pluginsEmailsService: EmailsService) { }




    @Post('plugins')
    @ApiOperation({ summary: 'Register a new plugin in Firestore' })
    @ApiCreatedResponse({ description: 'The plugin was created successfully', type: CreatePluginResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async registerNewPlugin(@Body() body: { domain: string;  }): Promise<CreatePluginResponseDto> {
        try {
            const { domain} = body;
            return await this.pluginsEmailsService.registerNewPlugin(domain);
        } catch (error) {
            console.error('Error registering the new plugin:', error);
            throw new Error(`Error registering the new plugin: ${error.message}`);
        }
    }







    @Post('plugins/emails')
    async registerEmail(@Body() body: { email: string; pluginId: string }): Promise<CreateEmailResponseDto> {
        try {
            const { email, pluginId } = body;
            const response = await this.pluginsEmailsService.registerEmail(email, pluginId);
            return response;
        } catch (error) {
            console.error('Error registering email:', error);
            throw new Error('Error registering email: ' + error.message);
        }
    }



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




    @Get('plugins/emails')
    async getEmailsByPluginId(@Query('pluginId') pluginId: string): Promise<GetEmailsResponseDto> {
        try {
            return this.pluginsEmailsService.getEmailsByPluginId(pluginId);
        } catch (error) {
            console.error('Error fetching emails by pluginId:', error);
            throw new Error('Error fetching emails by pluginId.');
        }
    }




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












