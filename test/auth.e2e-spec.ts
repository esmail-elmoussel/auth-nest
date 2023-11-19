import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { LoggingInterceptor } from '../src/interceptors/logging.interceptor';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mongodb: MongoMemoryServer;

  beforeEach(async () => {
    mongodb = await MongoMemoryServer.create();

    const mongoUri = mongodb.getUri();

    process.env.DATABASE_URL = mongoUri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalInterceptors(new LoggingInterceptor());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await mongodb.stop();
  });

  describe('Register', () => {
    it('should fail to register due to missing data', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(400)
        .then((res) => {
          expect(res.body.message.length).toBe(3);
          expect(res.body.message[0].includes('name')).toBeTruthy();
          expect(res.body.message[1].includes('email')).toBeTruthy();
          expect(res.body.message[2].includes('password')).toBeTruthy();
        });
    });

    it('should fail to register due to invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'sadasd', password: '123', name: 'test' })
        .expect(400)
        .then((res) => {
          expect(res.body.message.length).toBe(1);
          expect(res.body.message[0]).toBe('email must be an email');
        });
    });

    it('should register user successfully', async () => {
      const email = 'test@test.com';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: '123', name: 'test' })
        .expect(201)
        .then((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.email).toBe(email);
        });
    });

    it('should fail to register due to user already exists', async () => {
      const email = 'test@test.com';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: '123', name: 'test' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: '123', name: 'test' })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBe('Invalid credentials!');
        });
    });

    it('should hash the password correctly', async () => {
      const email = 'test@test.com';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: '123', name: 'test' })
        .expect(201)
        .then((res) => {
          expect(res.body.password).not.toBe('123');
          expect(res.body.password.split('.')[0]).toBeDefined();
          expect(res.body.password.split('.')[1]).toBeDefined();
        });
    });
  });

  describe('Login', () => {
    it('should fail due to missing data', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400)
        .then((res) => {
          expect(res.body.message.length).toBe(2);
          expect(res.body.message[0].includes('email')).toBeTruthy();
          expect(res.body.message[1].includes('password')).toBeTruthy();
        });
    });

    it('should fail due to invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'sadasd', password: '123' })
        .expect(400)
        .then((res) => {
          expect(res.body.message.length).toBe(1);
          expect(res.body.message[0]).toBe('email must be an email');
        });
    });

    it('should fail due to user not exists', async () => {
      const email = 'test@test.com';

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: '123' })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBe('Invalid credentials!');
        });
    });

    it('should fail due to incorrect password', async () => {
      const email = 'test@test.com';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: '123', name: 'test' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: '1223' })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBe('Invalid credentials!');
        });
    });

    it('should login user successfully', async () => {
      const email = 'test@test.com';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: '123', name: 'test' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: '123' })
        .expect(200)
        .then((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.accessToken.length > 20).toBeTruthy();
        });
    });
  });
});
