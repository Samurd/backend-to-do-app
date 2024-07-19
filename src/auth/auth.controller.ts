import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  Response as ResponseNest,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { GoogleAuthGuard } from './guards/google.guard';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';

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
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { user, access_token } = await this.authService.login(req.user);
    res.cookie('access_token', access_token, { httpOnly: true });
    return user;
  }

  
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  handleLogin() {}
  
  @UseGuards(GoogleAuthGuard)
  @Get('callback/google')
  async handleRedirect(
    @Query('error') error: string | undefined,
    @Request() req,
    @ResponseNest({ passthrough: true }) res: Response,
  ) {
    const { user } = req;
    const frontendUrl = process.env.FRONTEND_URL;
    const redirectUrl = `${frontendUrl}/todos`;
    const errorRedirectUrl = `${frontendUrl}/login`;
    
    if (error) {
      return res.redirect(errorRedirectUrl);
    }
    
    const { access_token } = await this.authService.login(user);
    res.cookie('access_token', access_token, { httpOnly: true });
    return res.redirect(redirectUrl);
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
