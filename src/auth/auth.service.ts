import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { HashUtility } from 'src/auth/utils/hash.utility';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashUtility: HashUtility,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.authRepository.findOneByEmail(createUserDto.email);

    if (user) {
      throw new BadRequestException('Account already exists!');
    }

    const hashedPassword = await this.hashUtility.hash(createUserDto.password);

    const newUser = await this.authRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
    });

    return newUser;
  }
}
