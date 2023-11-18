import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';

@Controller('/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

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
