import { useRequest } from 'hooks/useRequest';

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

export type LoginRequest = {
  username: string;
  password: string;
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
 * Параметры запроса на логин
 */
export const REQ_LOGIN_PARAMS: Parameters<typeof useRequest> = [
  'auth/login',
  'POST',
  false,
];
