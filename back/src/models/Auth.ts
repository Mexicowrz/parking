import { IsString, IsNotEmpty } from 'class-validator';
import * as jwt from 'jsonwebtoken';
import UserHelper from '../helpers/UserHelper';
import ApiHelper, { EmptyParams } from '../helpers/ApiHelper';

/**
 * Данные, необходимые для авторизации
 *
 * @export
 * @class Login
 */
export class Login {
  /** логин пользователя */
  @IsString()
  @IsNotEmpty()
  username!: string;

  /** пароль пользователя */
  @IsString()
  @IsNotEmpty()
  password!: string;
}

/**
 * Роли пользователей
 *
 * @export
 * @enum {Role}
 */
export enum Role {
  ADMIN = 0,
  PLACE_OWNER = 1,
  CUSTOMER = 2,
}

/**
 * Данные пользователя при авторизации
 *
 * @export
 * @type {UserData}
 */
export type UserData = {
  /** id пользователя */
  id: number;
  /** логин пользователя */
  username: string;
  /** имя пользователя */
  firstname: string;
  /** фамилия пользователя */
  lastname: string;
  /** отчетсво пользователя */
  middlename?: string;
  /** описание пользователя */
  description?: string;
  /** № квартиры пользователя */
  flat?: number;
  /** роль пользователя */
  role: Role;
};

/**
 * Ответ, содержащий пользовательские данные и токен авторизации
 *
 * @export
 * @type {TokenMessage}
 */
export type TokenMessage = {
  /** токен пользователя */
  token: string;
  /** данные пользователя */
  user: UserData;
};

/**
 * Данные, хранящиеся в токене авторизации
 *
 * @export
 * @type {JwtData}
 */
export type JwtData = {
  /** id пользователя */
  userid: number;
  /** логин пользовтаеля */
  username: string;
  /** роль пользователя */
  role: number;
};

/**
 * Список функций в БД
 */
const dbFunctions = {
  /** авторизация пользователя */
  LOGIN: 'auth.e_login',
  /** получение данных о пользователе при авторизации */
  GET_INFO: 'auth.e_user_getinfo',
};

/**
 * Авторизация пользователя
 *
 * @param  {Login} cred
 * @returns Promise<TokenMessage>
 */
export const login = async (cred: Login): Promise<TokenMessage> => {
  const userObject = await ApiHelper.executeDbFunction<UserData>(
    dbFunctions.LOGIN,
    [cred.username, cred.password],
  );
  const secret: jwt.Secret = process.env.JWT_SECRET!;

  const token = jwt.sign(
    {
      userid: userObject.id,
      username: userObject.username,
      role: userObject.role,
    },
    secret,
    { expiresIn: `${process.env['TOKEN_EXPIRES'] || 1}h` },
  );
  UserHelper.addUserToCache(userObject);

  return {
    token,
    user: userObject,
  };
};

/**
 * Проверить и обновить токен
 *
 * @param {string} token
 * @returns { payload: JwtData; newToken: string }
 */
export const verify = (
  token: string,
): { payload: JwtData; newToken: string } => {
  const jwtPayload = jwt.verify(token, process.env.JWT_SECRET!) as JwtData;
  // токен живет только 1 час
  // генерим новый токен на каждый запрос
  const newToken = jwt.sign(
    {
      userid: jwtPayload.userid,
      username: jwtPayload.username,
      role: jwtPayload.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: `${process.env['TOKEN_EXPIRES'] || 1}h`,
    },
  );

  return { payload: jwtPayload, newToken };
};

/**
 * Получить данные авторизованного пользователя
 *
 * @param  {string} username
 * @param  {EmptyParams} params
 */
export const getUserInfo = async (username: string, params: EmptyParams) =>
  ApiHelper.executeDbFunction<UserData>(dbFunctions.GET_INFO, [username]);
