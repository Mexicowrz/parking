import request from 'supertest';
import { nanoid } from 'nanoid';
import faker from 'faker';
import {
  connectDb,
  closeDb,
  apiUrl,
  app,
  createUser,
  deleteUser,
  makeUserData,
} from './jest.hooks';

beforeAll(async () => connectDb());
afterAll(async () => closeDb());

describe('Check user api', () => {
  let authToken = '';
  beforeAll(async () => {
    const {
      body: { token },
    } = await request(app.server)
      .post(apiUrl('auth/login'))
      .send({ username: 'admin', password: 'admin' });
    authToken = token;
    return;
  });
  describe('CRUD test', () => {
    let newUserId = 0;
    const userLogin = nanoid();
    const userData = { ...makeUserData(), username: userLogin };
    it('/POST /add - add new user (admin)', async () => {
      await request(app.server)
        .post(apiUrl('user/add'))
        .set('token', authToken)
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.anything());
          expect(response.body.id).toEqual(expect.any(Number));
          newUserId = response.body.id;
        });
      // проверить наличие пользователя
      return await request(app.server)
        .get(apiUrl('user/list'))
        .set('token', authToken)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
          expect(response.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ username: userLogin }),
            ]),
          );
        });
    });
    it('/POST /add - add new user with same login (admin)', async () => {
      return request(app.server)
        .post(apiUrl('user/add'))
        .set('token', authToken)
        .send({ ...userData, phone: faker.phone.phoneNumber })
        .expect('Content-Type', /json/)
        .expect(500);
    });
    it('/POST /add - add new user with same phone (admin)', async () => {
      return request(app.server)
        .post(apiUrl('user/add'))
        .set('token', authToken)
        .send({ ...userData, username: nanoid() })
        .expect('Content-Type', /json/)
        .expect(500);
    });
    it('PATCH /:id - modify user (admin)', async () => {
      const firstName = nanoid();
      await request(app.server)
        .patch(apiUrl(`user/${newUserId}`))
        .set('token', authToken)
        .send({ ...userData, firstname: firstName })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.anything());
          expect(response.body.id).toEqual(expect.any(Number));
        });
      // проверить наличие пользователя
      return await request(app.server)
        .get(apiUrl('user/list'))
        .set('token', authToken)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
          expect(response.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                username: userLogin,
                firstname: firstName,
              }),
            ]),
          );
        });
    });
    it('DELETE /:id - delete user (admin)', async () => {
      await request(app.server)
        .delete(apiUrl(`/user/${newUserId}`))
        .set('token', authToken)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.anything());
          expect(response.body.id).toEqual(expect.any(Number));
        });
      // проверить наличие пользователя
      return await request(app.server)
        .get(apiUrl('user/list'))
        .set('token', authToken)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
          expect(response.body).not.toEqual(
            expect.arrayContaining([
              expect.objectContaining({ username: userLogin }),
            ]),
          );
        });
    });
  });

  describe('Check role-based access (unauthorized)', () => {
    it('/GET user/list - get user list (unauthorized user)', async () => {
      return request(app.server).get(apiUrl('user/list')).expect(401);
    });
    it('/POST user/add - add user (unauthorized user)', async () => {
      return request(app.server).post(apiUrl('user/add')).expect(401);
    });
  });
  describe('Check role-based access (place owner)', () => {
    const username = nanoid();
    const password = nanoid();
    let ownerId = 0;
    beforeAll(async () => {
      const { id } = await createUser(authToken, username, password, 1);
      ownerId = id;
    });
    afterAll(async () => {
      await deleteUser(ownerId, authToken);
    });
    it('/POST user/add - add user (place owner)', async () => {
      const {
        body: { token },
      } = await request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username, password });
      return request(app.server)
        .post(apiUrl('user/add'))
        .set('token', token)
        .send(makeUserData())
        .expect(403);
    });
    it('/DELETE user/:id - delete user (place owner)', async () => {
      const {
        body: { token },
      } = await request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username, password });
      return request(app.server)
        .delete(apiUrl('user/1'))
        .set('token', token)
        .expect(403);
    });
  });
  describe('Check role-based access (customer)', () => {
    const username = nanoid();
    const password = nanoid();
    let customerId = 0;
    beforeAll(async () => {
      const { id } = await createUser(authToken, username, password, 2);
      customerId = id;
    });
    afterAll(async () => {
      await deleteUser(customerId, authToken);
    });
    it('/POST user/add - add user (customer)', async () => {
      const {
        body: { token },
      } = await request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username, password });
      return request(app.server)
        .post(apiUrl('user/add'))
        .set('token', token)
        .send(makeUserData())
        .expect(403);
    });
    it('/DELETE user/:id - delete user (customer)', async () => {
      const {
        body: { token },
      } = await request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username, password });
      return request(app.server)
        .delete(apiUrl('user/1'))
        .set('token', token)
        .expect(403);
    });
  });
});
