import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsString } from "class-validator";
import { Tags } from "../../tags/entities/tags.entity";
import { MessageType } from "./createMessage.dto";




export class UpdateMessageStatusDto {



    @ApiProperty({
        description: 'Indicates whether the message has been read',
        example: true,
        type: Boolean,
    })
    @IsBoolean()
    public isRead?: boolean;


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
    @IsBoolean()
    public isArchived?: boolean = false;



    @ApiProperty({
        description: 'Status of the message, can be active or not. If it is not active, then it is in the trash',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    isActive?: boolean = true;


    @ApiProperty({
        description: 'Timestamp of when the message was received',
        example: '2023-08-10T13:00:00Z',
        type: Date,
    })
    public readDate?: Date;


    @ApiProperty({
        description: 'Tags associated with the message',
    })
    public tags?: Tags[];

    @ApiProperty({
        description: 'It states whether the message is highlighted or not (Destacado)',
        example: true,
        type: String
    })
    @IsBoolean()
    isHighlight?: boolean;



}