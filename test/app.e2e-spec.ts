import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('App (e2e)', () => {
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
    await app.init();
  });

  afterAll(async () => {
    await mongodb.stop();
  });

  it('(GET) /health', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('App is healthy!');
  });
});
