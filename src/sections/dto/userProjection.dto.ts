import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, Matches, IsAlpha } from "class-validator";

export class UserProjection {
    @ApiProperty({
        description: 'Username the user will use for login, it must be unique between users',
        example: 'Test.1',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    @Matches('^[A-Z](?=.{0}[a-z]+[-._]{1}[1-9]{1,4}$).{1,20}$', '', { message: 'INVALIDUSERNAME' })
    username: string;  //Username

    @ApiProperty({
        description: 'Real name of the user',
        example: 'Juan Lopez',
        type: String,
    })
    @IsAlpha()
    @IsNotEmpty()
    @IsString()
    @Matches('^(?=.*[a-zA-Z]{1,}).{1,60}$', '', { message: 'Name must be a real name, no numbers nor special characters' })
    name: string;  //Real Name
}
