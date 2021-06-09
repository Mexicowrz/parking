import * as dotenv from 'dotenv';
import faker from 'faker';
import { nanoid } from 'nanoid';
import p from 'path';
import request from 'supertest';

dotenv.config({ path: p.join(__dirname, '../../config/.env') });

import app from '../src/app';
import { API_VERSION } from '../src/consts/api';

export const connectDb = () => {
  return app.connectServices(
    process.env.PG_HOST!,
    parseInt(process.env.PG_PORT!, 10),
    process.env.PG_DB!,
    process.env.PG_USER!,
    process.env.PG_PASSWORD!,
    process.env.REDIS_HOST!,
    parseInt(process.env.REDIS_PORT!, 10),
  );
};

export const closeDb = async () => {
  return app.disconnectServices();
};

export const apiUrl = (url: string) => `/api/v${API_VERSION}/${url}`;

export { app };

export const makeUserData = () => {
  return {
    username: nanoid(),
    lastname: faker.name.lastName(),
    middlename: faker.name.middleName(),
    firstname: faker.name.firstName(),
    flat: faker.datatype.number(400),
    is_blocking: false,
    description: faker.name.jobDescriptor(),
    phone: faker.phone.phoneNumber(),
    car_number: faker.datatype.string(5),
    places: [],
    password: nanoid(),
    role: 0,
  };
};

export const createUser = async (
  authToken: string,
  userLogin: string,
  password: string,
  role: number,
  places: number[] = [],
) => {
  const userData = {
    ...makeUserData(),
    username: userLogin,
    password,
    role,
    places,
  };

  const response = await request(app.server)
    .post(apiUrl('user/add'))
    .set('token', authToken)
    .send(userData);
  return response.body;
};

export const deleteUser = async (userId: number, authToken: string) => {
  return request(app.server)
    .delete(apiUrl('user/delete'))
    .send({ id: userId })
    .set('token', authToken);
};
