import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request as RequestNest,
  Res,
  Response as ResponseNest,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { GoogleAuthGuard } from './guards/google.guard';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { RefreshTokenGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { username, email, password } = body;

    return await this.authService.register({ username, email, password });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@RequestNest() req, @Res({ passthrough: true }) res: Response) {
    const { user } = await this.authService.login(req.user, res);
    return user;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  handleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('callback/google')
  async handleRedirect(
    @Query('error') error: string | undefined,
    @RequestNest() req,
    @ResponseNest({ passthrough: true }) res: Response,
  ) {
    const { user } = req;
    const frontendUrl = process.env.FRONTEND_URL;
    const redirectUrl = `${frontendUrl}/todos`;
    const errorRedirectUrl = `${frontendUrl}/login`;

    if (error) {
      return res.redirect(errorRedirectUrl);
    }

    await this.authService.login(user, res);

    return res.redirect(redirectUrl);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@RequestNest() req, @Res({ passthrough: true }) res: Response) {
    const { user } = await this.authService.login(req.user, res);
    return { user };
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@RequestNest() req) {
    const user = req.user;
    return this.usersService.findUserById(user.id);
  }
}
