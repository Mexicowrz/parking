import request from 'supertest';
import { mocked } from 'ts-jest/utils';
import { nanoid } from 'nanoid';
import UserPlaceUpdater from '../src/services/UserPlaceUpdater';
jest.mock('../src/services/UserPlaceUpdater');
// tslint:disable-next-line
const UserPlaceUpdaterMocked = mocked(UserPlaceUpdater, true) as any;
UserPlaceUpdaterMocked.Instance = {
  addConnection: jest
    .fn()
    .mockImplementation((req: any, res: any) => res.status(200).send({})),
  addFreeConnection: jest
    .fn()
    .mockImplementation((req: any, res: any) => res.status(200).send({})),
  changePlace: jest.fn(),
};

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

describe('Check place api', () => {
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
  it('GET /getall - get all places (admin)', async () => {
    return await request(app.server)
      .get(apiUrl('place/getall'))
      .set('token', authToken)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expect.any(Array));
        expect(response.body).toEqual(
          expect.arrayContaining([expect.objectContaining({ number: 1 })]),
        );
      });
  });
  describe('check place owner operations', () => {
    let ownerId = 0;
    let ownerToken = '';
    const userLogin = nanoid();
    const password = nanoid();
    beforeAll(async () => {
      const { id } = await createUser(authToken, userLogin, password, 1, [1]);
      ownerId = id;
      const {
        body: { token },
      } = await request(app.server)
        .post(apiUrl('auth/login'))
        .send({ username: userLogin, password });
      ownerToken = token;
    });
    afterAll(async () => {
      return deleteUser(ownerId, authToken);
    });

    it('GET /my - get user place list', async () => {
      UserPlaceUpdaterMocked.Instance.addConnection.mockClear();
      await request(app.server)
        .get(apiUrl(`place/my?token=${ownerToken}`))
        .expect(200)
        .then(() => {
          expect(
            UserPlaceUpdaterMocked.Instance.addConnection,
          ).toHaveBeenCalledTimes(1);
        });
    });

    it('GET /free - get free user place list', async () => {
      UserPlaceUpdaterMocked.Instance.addFreeConnection.mockClear();
      await request(app.server)
        .get(apiUrl(`place/free?token=${ownerToken}`))
        .expect(200)
        .then(() => {
          expect(
            UserPlaceUpdaterMocked.Instance.addFreeConnection,
          ).toHaveBeenCalledTimes(1);
        });
    });

    it('POST /tofree - to free owner place', async () => {
      UserPlaceUpdaterMocked.Instance.changePlace.mockClear();
      await request(app.server)
        .post(apiUrl(`place/my/tofree`))
        .set('token', ownerToken)
        .send({
          id: 1,
          date_from: new Date(),
          date_to: new Date(new Date().getTime() + 10000),
        })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toEqual(expect.any(Number));
          expect(
            UserPlaceUpdaterMocked.Instance.changePlace,
          ).toHaveBeenCalledTimes(1);
        });
    });

    it('POST /my/tofree - to free foreign place', async () => {
      await request(app.server)
        .post(apiUrl(`place/my/tofree`))
        .set('token', ownerToken)
        .send({
          id: 5,
          date_from: new Date(),
          date_to: new Date(new Date().getTime() + 10000),
        })
        .expect(403);
    });

    it('POST /free/take - to take free place', async () => {
      UserPlaceUpdaterMocked.Instance.changePlace.mockClear();
      await request(app.server)
        .post(apiUrl(`place/free/take`))
        .set('token', ownerToken)
        .send({
          id: 1, date_to: new Date(new Date().getTime() + 10000),
        })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toEqual(expect.any(Number));
          expect(
            UserPlaceUpdaterMocked.Instance.changePlace,
          ).toHaveBeenCalledTimes(1);
        });
    });


    it('POST /free/release - to release free place', async () => {
      UserPlaceUpdaterMocked.Instance.changePlace.mockClear();
      await request(app.server)
        .post(apiUrl(`place/free/release`))
        .set('token', ownerToken)
        .send({
          id: 1
        })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toEqual(expect.any(Number));
          expect(
            UserPlaceUpdaterMocked.Instance.changePlace,
          ).toHaveBeenCalledTimes(1);
        });
    });

    it('POST /my/release - to respond owner place', async () => {
      UserPlaceUpdaterMocked.Instance.changePlace.mockClear();
      await request(app.server)
        .post(apiUrl(`place/my/respond`))
        .set('token', ownerToken)
        .send({
          id: 1,
        })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toEqual(expect.any(Number));
          expect(
            UserPlaceUpdaterMocked.Instance.changePlace,
          ).toHaveBeenCalledTimes(1);
        });
    });
  });
});