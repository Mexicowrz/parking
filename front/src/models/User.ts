import { useRequest } from 'hooks/useRequest';
import { Role } from './Auth';
export type { IdResult, IdParams } from './Common';

/**
 * Структура пользователя для вывода в списке
 *
 * @exports
 * @class UserForList
 */
export type UserForList = {
  /** id пользователя */
  id: number;

  /** логин пользователя */
  username: string;

  /** фамилия пользователя */
  lastname: string;

  /** отчество пользователя */
  middlename: string;

  /** имя пользователя */
  firstname: string;

  /** квартира пользователя */
  flat: number;

  /** роль пользователя */
  role: Role;

  /** флаг блокировки пользователя */
  is_blocking: boolean;
};

/**
 * Общие данные пользователя
 *
 * @exports
 * @type User
 */
export type User = UserForList & {
  /** описание пользователя */
  description: string;

  /** телефон пользователя */
  phone: string;

  /** № ТС пользователя */
  car_number: string;

  /** места, которыми владеет пользователь */
  places: number[];

  /** пароль пользователя */
  password: string;
};

/**
 * Личные данные пользователя
 *
 * @exports
 * @type PrivateUser
 */
 export type PrivateUser = {
  /** id пользователя */
  id: number;

  /** пароль пользователя */
  password?: string;

  /** фамилия пользователя */
  lastname: string;

  /** отчество пользователя */
  middlename?: string;

  /** имя пользователя */
  firstname: string;

  /** телефон пользователя */
  phone?: string;
}

/** Параметры запроса на получение всех пользователей */
export const REQ_ALL_USERS_PARAMS: Parameters<typeof useRequest> = [
  'user/list',
];

/** Параметры запроса на добавлние пользователя */
export const REQ_ADD_USER_PARAMS: Parameters<typeof useRequest> = [
  'user/add',
  'POST',
];

/**
 * Функция получения запросов на удаление пользователя
 * @param  {number} id
 * @returns Parameters
 */
export const makeDeletUserParams = (
  id: number,
): Parameters<typeof useRequest> => [`user/${id}`, 'DELETE'];

/**
 * Функция получения запросов на загрузку пользователя
 * @param  {number} id
 * @returns Parameters
 */
export const makeGetUserParams = (
  id: number,
): Parameters<typeof useRequest> => [`user/${id}`];

/**
 * Функция получения запросов на обновление пользователя
 * @param  {number} id
 * @returns Parameters
 */
 export const makeUpdateUserParams = (
  id: number,
): Parameters<typeof useRequest> => [`user/${id}`, 'PATCH'];


/**
 * Функция получения запросов на обновление личной информации пользователя
 * @param  {number} id
 * @returns Parameters
 */
 export const makePrivateUpdateUserParams = (
  id: number,
): Parameters<typeof useRequest> => [`user/lk/${id}`, 'PATCH'];
