import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { GoogleUserDto } from './dto/googleUser.dto';
import { PrismaService } from 'src/lib/prisma.service';

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

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new BadRequestException('Invalid credentials');

    if (!user.password) throw new BadRequestException("Try using other login method");

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

  async login(user: any) {
    const isUser = await this.usersService.findOneByEmail(user.email);
    if (!isUser) throw new BadRequestException('Invalid email or password');
    const { password, ...result } = user;

    return {
      user: result,
      access_token: this.jwtService.sign(result),
    };
  }
}
