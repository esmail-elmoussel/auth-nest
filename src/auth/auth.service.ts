import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { HashService } from './utils/hash.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.authRepository.findOneByEmail(createUserDto.email);

    if (user) {
      this.logger.log(`User ${user.id} already exists!`);

      throw new BadRequestException('Invalid credentials!'); // for security purposes, not to expose the existence of a user!
    }

    const hashedPassword = await this.hashService.hash(createUserDto.password);

    const newUser: User = await this.authRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
    });

    this.logger.log(`User ${newUser.id} created successfully!`);

    return newUser;
  }

  /**
   * Login user
   * @param loginUserDto
   * @returns user access token
   */
  async login(loginUserDto: LoginUserDto): Promise<string> {
    const user = await this.authRepository.findOneByEmail(loginUserDto.email);

    if (!user) {
      this.logger.log(`User ${loginUserDto.email} not exists!`);

      throw new BadRequestException('Invalid credentials!'); // for security purposes, not to expose the existence of a user!
    }

    const isPasswordCorrect = await this.hashService.validate(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      this.logger.log(`Incorrect password for ${user.id}`);

      throw new BadRequestException('Invalid credentials!'); // for security purposes, not to expose the existence of a user!
    }

    this.logger.log(`User ${user.id} logged in successfully!`);

    const payload = { userId: user.id };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d', // TODO: handle token expiration!
    });

    return accessToken;
  }
}
