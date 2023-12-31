import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

const validPassword = 'pas$w0rd12';

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
    it('should fail due to missing data', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(400);
    });

    it('should fail due to invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'sadasd', password: validPassword, name: 'test' })
        .expect(400);
    });

    describe('Password Validation', () => {
      it('should fail due to that password is less than 8 chars', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'test@test.com', password: '1234567', name: 'test' })
          .expect(400);
      });

      it('should fail due to that password does not contain any letters', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@test.com',
            password: '123@?565645',
            name: 'test',
          })
          .expect(400);
      });

      it('should fail due to that password does not contain any special letters', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@test.com',
            password: '1234sadasd5678',
            name: 'test',
          })
          .expect(400);
      });

      it('should fail due to that password does not contain any numbers', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@test.com',
            password: 'asddas@##SAd',
            name: 'test',
          })
          .expect(400);
      });
    });

    it('should register user successfully', async () => {
      const email = 'test@test.com';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: validPassword, name: 'test' })
        .expect(201)
        .then((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.email).toBe(email);
        });
    });

    it('should fail due to user already exists', async () => {
      const email = 'test@test.com';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: validPassword, name: 'test' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: validPassword, name: 'test' })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBe('Invalid credentials!');
        });
    });

    it('should hash the password correctly', async () => {
      const email = 'test@test.com';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: validPassword, name: 'test' })
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
        .send({ email: 'sadasd', password: validPassword })
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
        .send({ email, password: validPassword })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toBe('Invalid credentials!');
        });
    });

    it('should fail due to incorrect password', async () => {
      const email = 'test@test.com';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: validPassword, name: 'test' })
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
        .send({ email, password: validPassword, name: 'test' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: validPassword })
        .expect(200)
        .then((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.accessToken.length > 20).toBeTruthy();
        });
    });
  });
});
