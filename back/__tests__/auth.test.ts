import request from 'supertest';
import { connectDb, closeDb, apiUrl, app } from './jest.hooks';

beforeAll(async () => connectDb());

afterAll(async () => closeDb());

describe('Check authorization', () => {
  describe('POST /login', () => {
    it('login require', async () => {
      return request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username: '', password: 'admin' })
        .expect(500)
        .then((response) => {
          expect(response.body?.messages).toEqual(
            expect.arrayContaining(['username should not be empty']),
          );
        });
    });
    it('password require', async () => {
      return request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username: 'admin', password: '' })
        .expect(500)
        .then((response) => {
          expect(response.body?.messages).toEqual(
            expect.arrayContaining(['password should not be empty']),
          );
        });
    });
    it('wrong password', async () => {
      return request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username: 'admin', password: 'wrong' })
        .expect(403)
        .then((response) => {
          expect(response.body?.messages).toEqual(
            expect.arrayContaining(['wrong_password']),
          );
        });
    });
    it('admin success login', async () => {
      return request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username: 'admin', password: 'admin' })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.anything());
          expect(response.body.token).toEqual(expect.anything());
          expect(response.body.user).toMatchSnapshot();
        });
    });
  });

  describe('GET /current', () => {
    it('unauthorized request', async () => {
      return request(app.server)
        .get(apiUrl('auth/current'))
        .expect(401)
        .then((response) => {
          expect(response.body?.messages).toEqual(
            expect.arrayContaining(['unauthorized']),
          );
        });
    });
    it('admin request', async () => {
      const {
        body: { token },
      } = await request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username: 'admin', password: 'admin' });

      return request(app.server)
        .get(apiUrl('/auth/current'))
        .set('token', token)
        .expect(200)
        .then((response) => {
          expect(response.body).toMatchSnapshot();
        });
    });
  });
});
