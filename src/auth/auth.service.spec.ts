import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HashService } from './utils/hash.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { authRepositoryMock } from './__mocks__/auth.repository.mock';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { hashServiceMock } from './utils/__mocks__/hash.service.mock';
import { jwtMock } from './__mocks__/jwt.service.mock';
import { LoginUserDto } from './dtos/login-user.dto';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: authRepositoryMock },
        { provide: HashService, useValue: hashServiceMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw BadRequestException if user already exists', async () => {
      authRepositoryMock.findOneByEmail.mockReturnValueOnce({
        id: '1',
        name: '<NAME>',
        email: '<EMAIL>',
        password: '<PASSWORD>',
      } as unknown as User);

      try {
        await service.register({
          name: '<NAME>',
          email: '<EMAIL>',
          password: '<PASSWORD>',
        });

        throw new Error('Should not reach this point');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual('Invalid credentials!');
      }
    });

    it('should call create method with a hashed password, not the plain text password', async () => {
      const createUserDto = {
        name: '<NAME>',
        email: '<EMAIL>',
        password: '<PASSWORD>',
      };

      authRepositoryMock.create.mockReturnValueOnce({
        id: '1',
        ...createUserDto,
      } as unknown as User);

      hashServiceMock.hash.mockReturnValue('hashedPassword');

      await service.register(createUserDto);

      expect(authRepositoryMock.create).toHaveBeenCalled();

      expect(authRepositoryMock.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword',
      });
    });

    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      authRepositoryMock.findOneByEmail.mockReturnValueOnce(null);

      authRepositoryMock.create.mockReturnValueOnce({
        id: '1',
        ...createUserDto,
      } as unknown as User);

      const result: User = await service.register(createUserDto);

      expect(result).toEqual({ id: '1', ...createUserDto });
      expect(authRepositoryMock.findOneByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
    });
  });

  describe('Login', () => {
    it('should fail due to user not found', async () => {
      try {
        await service.login({
          email: 'test@test.com',
          password: '123',
        });

        throw new Error('Should not reach this point');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual('Invalid credentials!');
      }
    });

    it('should fail due to wrong password', async () => {
      const createUserDto: CreateUserDto = {
        name: 'test',
        email: 'test@test.com',
        password: '123456',
      };

      authRepositoryMock.findOneByEmail.mockReturnValue({
        id: '1',
        ...createUserDto,
      });

      hashServiceMock.validate.mockReturnValueOnce(false);

      try {
        await service.login({
          email: 'test@test.com',
          password: '123',
        });

        throw new Error('Should not reach this point');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual('Invalid credentials!');
      }
    });

    it('should call hash service with the right params', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@test.com',
        password: '123456',
      };

      authRepositoryMock.findOneByEmail.mockReturnValue({
        id: '1',
        ...loginUserDto,
        password: 'hashedPassword',
      });

      hashServiceMock.validate.mockReturnValueOnce(true);

      jwtMock.signAsync.mockReturnValueOnce('token');

      await service.login(loginUserDto);

      expect(hashServiceMock.validate).toHaveBeenCalled();
      expect(hashServiceMock.validate).toHaveBeenCalledWith(
        loginUserDto.password,
        'hashedPassword',
      );
    });

    it('should login successfully', async () => {
      const createUserDto: CreateUserDto = {
        name: 'test',
        email: 'test@test.com',
        password: '123456',
      };

      authRepositoryMock.findOneByEmail.mockReturnValue({
        id: '1',
        ...createUserDto,
      });

      hashServiceMock.validate.mockReturnValueOnce(true);

      jwtMock.signAsync.mockReturnValueOnce('token');

      const accessToken = await service.login({
        email: 'test@test.com',
        password: '456',
      });

      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
    });
  });
});
