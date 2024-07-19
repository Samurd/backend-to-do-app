import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(private prismaService: PrismaService) {}

  async create(createTodoDto: CreateTodoDto) {
    try {
      return this.prismaService.todos.create({
        data: createTodoDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong while creating todo.',
      );
    }
  }

  async findAllByUser(userId: string) {
    return this.prismaService.todos.findMany({
      where: {
        userId,
      },
    });
  }

  async update(updateTodoDto: UpdateTodoDto) {
    return this.prismaService.todos.update({
        where: {
            id: updateTodoDto.id
        },
        data: {
            isCompleted: updateTodoDto.isCompleted
        }
    })
  }

  async delete(id: string) {
    return this.prismaService.todos.delete({
      where: {
        id,
      },
    });
  }
}
