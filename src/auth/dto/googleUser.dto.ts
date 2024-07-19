import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  isString,
  IsString,
  MinLength,
} from 'class-validator';

export class GoogleUserDto {
  @IsString()
  @IsOptional()
  img?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}
