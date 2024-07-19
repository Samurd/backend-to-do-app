import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    return this.todosService.create({
      ...createTodoDto,
      userId: req.user.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId')
  async findAllByUser(@Param('userId') userId: string) {
    return this.todosService.findAllByUser(userId);
  }

  @Patch('/:id')
  async update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update({
      id,
      ...updateTodoDto
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.todosService.delete(id);
  }
}
