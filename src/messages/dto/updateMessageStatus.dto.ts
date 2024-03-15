import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Tags } from "../../tags/entities/tags.entity";
import { MessageType } from "./createMessage.dto";




export class UpdateMessageStatusDto {


    @ApiProperty({
        description: 'Indicates whether the message has been read',
        example: true,
        type: Boolean,
    })
    @IsOptional()
    public read?: boolean;


    @ApiProperty({
        description: 'Type of the message',
        example: MessageType.Inquiry,
        enum: MessageType,
    })
    public type?: MessageType;




    @ApiProperty({
        description: 'Indicates whether the message has been archived',
        example: true,
        type: Boolean,
        default: false,
    })
    @IsOptional()
    public archived?: boolean = false;



    @ApiProperty({
        description: 'Status of the message, can be active or not. If it is not active, then it is in the trash',
        example: true,
        default: true,
        type: String
    })
    @IsOptional()
    active?: boolean = true;




    @ApiProperty({
        description: 'It states whether the message is highlighted or not (Destacado)',
        example: true,
        type: String
    })
    @IsOptional()
    highlighted?: boolean;



}