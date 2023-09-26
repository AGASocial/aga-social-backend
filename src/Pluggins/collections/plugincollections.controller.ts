import { BadRequestException, Body, Controller, Delete, Get, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AddJsonSectionsResponseDto } from "./dto/addJsonSectionsResponse.dto";
import { CreateJsonResponseDto } from "./dto/createJsonResponse.dto";
import { DeleteJsonSectionsResponseDto } from "./dto/deleteJsonSectionsResponse.dto";
import { GetJsonByIdResponseDto } from "./dto/getCompleteJsonByIdResponse.dto";
import { UpdateJsonResponseDto } from "./dto/updateJsonResponse.dto";
import { PluginCollectionsService } from "./plugincollections.service";






@Controller()
@ApiTags('PluginsCollections')
export class PluginCollectionsController {
    constructor(private readonly pluginsEmailsService: PluginCollectionsService) { }





    @Post('plugins/jsons')
    async registerJson(
        @Query('pluginId') pluginId: string,
        @Query('username') username: string,
        @Body() jsonData: any,
    ): Promise<CreateJsonResponseDto> {
        try {
            return this.pluginsEmailsService.registerJson(pluginId, username, jsonData);
        } catch (error) {
            throw new BadRequestException(`Error registering JSON: ${error.message}`);
        }
    }





    @Get('plugins/jsons')
    async getJsonById(
        @Query('pluginId') pluginId: string,
        @Query('jsonId') jsonId: string,
    ): Promise<GetJsonByIdResponseDto> {
        try {
            return this.pluginsEmailsService.getJsonById(pluginId, jsonId);
        } catch (error) {
            throw new BadRequestException(`Error retrieving JSON: ${error.message}`);
        }
    }



    @Get('plugins/jsons/sections')
    async getJsonSectionById(
        @Query('pluginId') pluginId: string,
        @Query('jsonId') jsonId: string,
        @Query('sectionName') sectionName: string,
    ): Promise<GetJsonByIdResponseDto> {

        try {
            const response = await this.pluginsEmailsService.getJsonSectionById(pluginId, jsonId, sectionName);
            return response;
        } catch (error) {
            throw new BadRequestException(`Error retrieving JSON: ${error.message}`);
        }
    }



    @Put('plugins/jsons')
    async addJsonSections(
        @Body('pluginId') pluginId: string,
        @Body('jsonId') jsonId: string,
        @Body('newSections') newSections: any
    ): Promise<AddJsonSectionsResponseDto> {
        try {
            const response = await this.pluginsEmailsService.addJsonSections(pluginId, jsonId, newSections);
            return response;
        } catch (error) {
            throw new BadRequestException(`Error adding JSON sections: ${error.message}`);
        }
    }



    @Delete('plugins/jsons')
    async deleteJsonSectionById(
        @Query('pluginId') pluginId: string,
        @Query('jsonId') jsonId: string,
        @Query('sectionName') sectionName: string
    ): Promise<DeleteJsonSectionsResponseDto> {
        try {
            return await this.pluginsEmailsService.deleteJsonSectionById(pluginId, jsonId, sectionName);
        } catch (error) {
            throw new BadRequestException(`Error deleting JSON sections: ${error.message}`);
        }
    }





    @Patch('plugins/jsons')
    async updateJsonSection(@Body() requestPayload: any): Promise<UpdateJsonResponseDto> {
        try {
            const { pluginId, jsonId, sectionName, updatedData } = requestPayload;
            return this.pluginsEmailsService.updateJsonSection(pluginId, jsonId, sectionName, updatedData);
        } catch (error) {
            throw new BadRequestException(`Error updating JSON section: ${error.message}`);
        }
    }








}