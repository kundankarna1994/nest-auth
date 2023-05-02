import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class RefreshTokenDto {
    @IsNotEmpty()
    @IsString()
    refreshToken: string
}