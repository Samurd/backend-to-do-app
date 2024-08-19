import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { GoogleUserDto } from './dto/googleUser.dto';
import { PrismaService } from 'src/lib/prisma.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async googleValidate(googleUserDto: GoogleUserDto) {
    try {
      const user = await this.prismaService.users.findUnique({
        where: {
          email: googleUserDto.email,
        },
      });
      if (user) {
        const { password, ...result } = await this.prismaService.users.update({
          where: {
            email: googleUserDto.email,
          },
          data: {
            img: googleUserDto.img,
            name: googleUserDto.name,
            lastName: googleUserDto.lastname,
          },
        });

        return result;
      }

      const newUser = await this.usersService.createUser({
        img: googleUserDto.img,
        username: googleUserDto.username,
        email: googleUserDto.email,
      });

      return newUser;
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, please try again',
      );
    }
  }

  async validateRefreshToken(refreshToken: string, userId: string) {
    try {
      const { password, ...user } = await this.prismaService.users.findFirst({
        where: { id: userId },
      })

      if(!user || !user.refresh_token) return null;

      const authenticated =  await bcrypt.compare(refreshToken, user.refresh_token);

      if(!authenticated) throw new UnauthorizedException();

      return user;

    } catch (error) {
      throw new UnauthorizedException("Refresh token invalid");
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new BadRequestException('Invalid credentials');

    if (!user.password)
      throw new BadRequestException('Try using other login method');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async register(createUserDto: CreateUserDto) {
    const userEmail = await this.usersService.findOneByEmail(
      createUserDto.email,
    );
    if (userEmail) throw new BadRequestException('Email already in use');

    const username = await this.usersService.findOneByUsername(
      createUserDto.username,
    );
    if (username) throw new BadRequestException('Username already in use');

    const { password, ...data } = createUserDto;

    return this.usersService.createUser({
      ...data,
      password: bcrypt.hashSync(password, +process.env.SALT_ROUNDS),
    });
  }

  async login(user: any, response: Response) {
    const isUser = await this.usersService.findOneByEmail(user.email);
    if (!isUser) throw new BadRequestException('Invalid email or password');
    const { password, refresh_token, ...result } = user;

    const tokenPayload = {
      id: result.id,
    }

    
    const access_token = this.jwtService.sign(tokenPayload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(tokenPayload, { expiresIn: '7d' });

    await this.usersService.updateUser(user.id, { refresh_token: bcrypt.hashSync(refreshToken, 10) });

    response.cookie("access_token", access_token, { httpOnly: true, sameSite: 'none', secure: true });
    response.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: 'none', secure: true});

    return {
      user: result,
      access_token: access_token,
    };
  }
}
