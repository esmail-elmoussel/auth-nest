import { Body, Controller, Logger, Post } from '@nestjs/common';
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
  async login(@Body() body: LoginUserDto) {
    const registeredUser = await this.authService.login(body);

    this.logger.log(`User ${registeredUser.id} registered successfully!`);

    return registeredUser;
  }
}
