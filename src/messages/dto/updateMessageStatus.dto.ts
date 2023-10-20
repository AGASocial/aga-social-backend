import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Tags } from "../../tags/entities/tags.entity";
import { MessageType } from "./createMessage.dto";




export class UpdateMessageStatusDto {


    @ApiProperty({
        description: 'Firestore ID of the message',
        example: 'abcdef123456',
        type: String
    })
    @IsNotEmpty()
    id: string;


    @ApiProperty({
        description: 'Indicates whether the message has been read',
        example: true,
        type: Boolean,
    })
    @IsBoolean()
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
    @IsBoolean()
    public archived?: boolean = false;



    @ApiProperty({
        description: 'Status of the message, can be active or not. If it is not active, then it is in the trash',
        example: true,
        default: true,
        type: String
    })
    @IsBoolean()
    active?: boolean = true;


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
    highlighted?: boolean;



}