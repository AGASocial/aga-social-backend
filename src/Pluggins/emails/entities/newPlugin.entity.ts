import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class NewPlugin {
    @ApiProperty({
        description: 'ID of the plugin',
        type: String,
    })
    @IsString()
    pluginId: string;

    @ApiProperty({
        description: 'ID of the user',
        type: String,
    })
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'Domain of the plugin',
        type: String,
    })
    @IsString()
    domain: string;

    constructor(pluginId: string, userId: string, domain: string) {
        this.pluginId = pluginId;
        this.userId = userId;
        this.domain = domain;
    }
}


