import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, Length, MaxLength } from "class-validator";

export class RecoverOtpDto {
    @ApiProperty({
        description: 'Credential the user will use for recovering password, it can be the username or the email',
        examples: ['Test.1','email@test.com'],
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @Matches('(^([a-z0-9._-]+)@([a-z0-9]+).([a-z]{2,10})(.[.a-z]{3,})?$)|(^[A-Z](?=.{0}[a-z]+[-._]{1}[1-9]{1,4}$).{1,30}$)','',{message: 'INVALIDUSER'})
    user: string;

    @ApiProperty({
        description: 'Security answer used to validate user',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    public security_answer: string;

    @ApiProperty({
        description: 'Password used to validate user.',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    @Length(8,30)
    public password: string;
}