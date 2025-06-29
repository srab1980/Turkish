import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestPass123!',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('user');
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
        expect(res.body.user.email).toBe('test@example.com');
      });
  });

  it('/auth/login (POST)', async () => {
    // First register a user
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'login@example.com',
        password: 'TestPass123!',
        username: 'loginuser',
        firstName: 'Login',
        lastName: 'User',
      });

    // Then try to login
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'login@example.com',
        password: 'TestPass123!',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('user');
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
      });
  });
});
