import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class Role {
    @ApiProperty({
        description: 'Role name',
        example: 'Subscriber, Publisher or Admin',
    })
    @IsNotEmpty()
    @IsString()
    public name: string;

    @ApiProperty({
        description: 'Describes the role and its nature',
        example: 'Subscribers are user that can buy courses and e-books offered by Publishers',
    })
    @IsNotEmpty()
    @IsString()
    public description: string;

    @ApiProperty({
        description: 'Indicates if the role is the defaukt for new users. Subscriber is, Publisher and Admin are not',
        example: true,
    })
    @IsNotEmpty()
    @IsBoolean()
    public default: boolean;

    @ApiProperty({
        description: 'Indicates if the role is enabled or disabled',
        example: true,
    })
    @IsNotEmpty()
    @IsBoolean()
    public active: boolean;


}
