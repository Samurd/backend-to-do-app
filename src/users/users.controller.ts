import { Controller, Get, InternalServerErrorException, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}


    @Get("/:email")
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('email') email: string) {
        try {
            const {password, ...result} = await this.usersService.findOneByEmail(email);

            return result;
        } catch (error) {
            throw new InternalServerErrorException("Something went wrong");
        }
    }

}
