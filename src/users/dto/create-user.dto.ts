import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsOptional()
    img?: string
    
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    lastname?: string

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @MinLength(5)
    password?: string;
}