import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateEmailResponseDto } from "./dto/createEmailResponse.dto";
import { CreatePluginResponseDto } from "./dto/createPluginResponse.dto";
import { CreateUserDto } from "./dto/createUser.dto";
import { CreateUserResponseDto } from "./dto/createUserResponse.dto";
import { GetEmailsResponseDto } from "./dto/getEmailsResponse.dto";
import { GetUsersByPluginIdResponseDto } from "./dto/getUsersResponse.dto";
import { SendEmailResponseDto } from "./dto/sendEmailToAllResponse.dto";
import { SendMessageToAllDto } from "./dto/sendMessageToAll.dto";
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



    @ApiOperation({ summary: 'Get emails by plugin ID' })
    @ApiQuery({ name: 'pluginId', type: String, description: 'Plugin ID' })
    @ApiResponse({ status: 200, description: 'Success in retrieving emails', type: GetEmailsResponseDto })
    @ApiResponse({ status: 404, description: 'Plugin not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Get('plugins/emails')
    async getEmailsByPluginId(@Query('pluginId') pluginId: string): Promise<GetEmailsResponseDto> {
        try {
            return this.pluginsEmailsService.getEmailsByPluginId(pluginId);
        } catch (error) {
            console.error('Error fetching emails by pluginId:', error);
            throw new Error('Error fetching emails by pluginId.');
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


    /*
    @ApiOperation({ summary: 'Send emails by plugin ID' })
    @ApiQuery({ name: 'pluginId', type: String, description: 'Plugin ID' })
    @ApiBody({ type: SendMessageToAllDto, description: 'Data to send to all users' })
    @ApiResponse({ status: 200, description: 'Success in sending emails', type: SendEmailResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Plugin not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('plugins/messages')
    async sendEmails(@Query('pluginId') pluginId: string, @Body() sendMessageToAllDto: SendMessageToAllDto): Promise<SendEmailResponseDto> {
        try {
            const response = await this.pluginsEmailsService.sendEmailsByPluginId(pluginId, sendMessageToAllDto);
            return response;
        } catch (error) {
            throw error;
        }
    }*/





}












