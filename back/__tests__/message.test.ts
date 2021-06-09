import request from 'supertest';
import { nanoid } from 'nanoid';
import { connectDb, closeDb, apiUrl, app } from './jest.hooks';

beforeAll(async () => connectDb());
afterAll(async () => closeDb());

describe('Check messages api', () => {
  describe('CRUD test', () => {
    let authToken = '';
    let newMessageId = 0;
    let messageTitle = nanoid();
    beforeAll(async () => {
      const {
        body: { token },
      } = await request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username: 'admin', password: 'admin' });
      authToken = token;
      return;
    });
    it('GET /get - get visible messages empty list (admin)', async () => {
      return await request(app.server)
        .get(apiUrl('message/get'))
        .set('token', authToken)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });

    it('GET /list - get all messages empty list (admin)', async () => {
      return await request(app.server)
        .get(apiUrl('message/list'))
        .set('token', authToken)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });

    it('POST /add - add new message (admin)', async () => {
      await request(app.server)
        .post(apiUrl('message/add'))
        .set('token', authToken)
        .send({ message: messageTitle, is_visible: true, type: 0 })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.anything());
          expect(response.body.id).toEqual(expect.any(Number));
          newMessageId = response.body.id;
        });
      // проверить наличие сообщения
      return await request(app.server)
        .get(apiUrl('message/get'))
        .set('token', authToken)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
          expect(response.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ message: messageTitle }),
            ]),
          );
        });
    });
    it('GET /list - get all messages (admin)', async () => {
      return await request(app.server)
        .get(apiUrl('message/list'))
        .set('token', authToken)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
          expect(response.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ message: messageTitle }),
            ]),
          );
        });
    });
    it('PATCH /:id - modify message (admin)', async () => {
      messageTitle = nanoid();
      await request(app.server)
        .patch(apiUrl(`/message/${newMessageId}`))
        .set('token', authToken)
        .send({ message: messageTitle, is_visible: true, type: 0 })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.anything());
          expect(response.body.id).toEqual(expect.any(Number));
        });
      // проверить наличие сообщения
      return await request(app.server)
        .get(apiUrl('message/get'))
        .set('token', authToken)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
          expect(response.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ message: messageTitle }),
            ]),
          );
        });
    });

    it('DELETE /:id - delete message (admin)', async () => {
      await request(app.server)
        .delete(apiUrl(`/message/${newMessageId}`))
        .set('token', authToken)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.anything());
          expect(response.body.id).toEqual(expect.any(Number));
        });
      // проверить наличие сообщения
      return await request(app.server)
        .get(apiUrl('message/get'))
        .set('token', authToken)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
          expect(response.body).not.toEqual(
            expect.arrayContaining([
              expect.objectContaining({ message: messageTitle }),
            ]),
          );
        });
    });
  });
});
