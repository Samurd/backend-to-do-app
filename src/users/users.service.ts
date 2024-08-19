import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findUserById(id: string) {
    try {
      return await this.prismaService.users.findFirst({
        where: {
          id
        }
      })

    } catch {
      throw new InternalServerErrorException('Error retrieving user');
    }
  }

  async findOneByEmail(email: string): Promise<any> | null {
    try {
      const user = await this.prismaService.users.findFirst({
        where: { email },
      });
      return user || null;
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving user');
    }
  }

  async findOneByUsername(username: string) {
    try {
      const user = await this.prismaService.users.findUnique({
        where: {
          username,
        },
      });

      if (!user) {
        return undefined;
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving user');
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { password, ...data } = await this.prismaService.users.create({
        data: {
          img: createUserDto.img ?? null,
          name: createUserDto.name ?? null,
          lastName: createUserDto.lastname ?? null,
          email: createUserDto.email,
          password: createUserDto.password ?? null,
          username: createUserDto.username,
        },
      });

      return data;
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async updateUser(id: string, data: any) {
    try {
      return await this.prismaService.users.update({
        where: {
          id,
        },
        data: {
          ...data,
        }
      });
    } catch (error) {
      throw new InternalServerErrorException('Error updating user');
    }
  }
}
