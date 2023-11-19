import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { RequestWithUser } from 'src/types/global.types';

@Controller('/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('/current-user')
  @UseGuards(AuthGuard)
  async getCurrentUser(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    const registeredUser = await this.authService.register(body);

    this.logger.log(`User ${registeredUser.id} registered successfully!`);

    return registeredUser;
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() body: LoginUserDto) {
    const accessToken = await this.authService.login(body);

    return { accessToken };
  }
}
