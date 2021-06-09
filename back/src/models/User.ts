import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

import { Role } from './Auth';
import ApiHelper, {
  EmptyParams,
  IdParams,
  IdResult,
} from '../helpers/ApiHelper';

/**
 * Структура пользователя для вывода в списке
 *
 * @exports
 * @class UserForList
 */
export class UserForList {
  /** id пользователя */
  @IsNumber()
  @IsOptional()
  id!: number;

  /** логин пользователя */
  @IsString()
  username!: string;

  /** фамилия пользователя */
  @IsString()
  lastname!: string;

  /** отчество пользователя */
  @IsString()
  @IsOptional()
  middlename!: string;

  /** имя пользователя */
  @IsString()
  firstname!: string;

  /** квартира пользователя */
  @IsNumber()
  flat!: number;

  /** роль пользователя */
  @IsNumber()
  role!: Role;

  /** флаг блокировки пользователя */
  @IsBoolean()
  @IsOptional()
  is_blocking!: boolean;
}

/**
 * Общие данные пользователя
 *
 * @exports
 * @class User
 */
export class User extends UserForList {
  /** описание пользователя */
  @IsString()
  @IsOptional()
  description!: string;

  /** телефон пользователя */
  @IsString()
  @IsOptional()
  phone!: string;

  /** № ТС пользователя */
  @IsString()
  @IsOptional()
  car_number!: string;

  /** места, которыми владеет пользователь */
  @IsArray()
  @IsOptional()
  places!: number[];

  /** пароль пользователя */
  @IsString()
  @IsOptional()
  password!: string;
}

/**
 * Личные данные пользователя
 *
 * @exports
 * @class PrivateUser
 */
export class PrivateUser {
  /** id пользователя */
  @IsNumber()
  @IsOptional()
  id!: number;

  /** пароль пользователя */
  @IsString()
  @IsOptional()
  password!: string;

  /** фамилия пользователя */
  @IsString()
  lastname!: string;

  /** отчество пользователя */
  @IsString()
  @IsOptional()
  middlename!: string;

  /** имя пользователя */
  @IsString()
  firstname!: string;

  /** телефон пользователя */
  @IsString()
  @IsOptional()
  phone!: string;
}

/**
 * Список функций в БД для работы с пользователями
 */
const dbFunctions = {
  /** получить список пользователей */
  GET_LIST: 'auth.e_user_get_list',
  /** добавить пользователя */
  ADD: 'auth.e_user_add',
  /** получить пользователя */
  GET: 'auth.e_user_get',
  /** обновить пользователя */
  UPDATE: 'auth.e_user_update',
  /** удалить пользователя */
  DELETE: 'auth.e_user_delete',
  /** обновить личные данные пользователя */
  PRIVATE_UPDATE: 'auth.e_user_private_update',
};

/**
 * Получить список пользователей
 *
 * @param  {string} username
 * @param  {EmptyParams} params
 * @return {UserForList[]}
 */
export const listUser = async (username: string, params: EmptyParams) =>
  ApiHelper.executeDbFunction<UserForList[]>(dbFunctions.GET_LIST, [username]);

/**
 * Добавить пользователя
 *
 * @param  {string} username
 * @param  {User} params
 * @returns {IdResult}
 */
export const addUser = async (username: string, params: User) =>
  ApiHelper.executeDbFunction<IdResult>(dbFunctions.ADD, [
    username,
    params.username,
    params.password,
    params.lastname,
    params.firstname,
    params.middlename,
    params.description,
    params.flat,
    params.role,
    params.is_blocking,
    params.places,
    params.phone,
    params.car_number,
  ]);

/**
 * Получить данные пользователя
 *
 * @param  {string} username
 * @param  {IdParams} params
 * @returns {User}
 */
export const getUser = async (username: string, params: IdParams) =>
  ApiHelper.executeDbFunction<User>(dbFunctions.GET, [username, params.id]);

/**
 * Обновить данные пользователя
 *
 * @param  {string} username
 * @param  {User} params
 * @returns {IdResult}
 */
export const updateUser = async (username: string, params: User) => {
  return ApiHelper.executeDbFunction<IdResult>(dbFunctions.UPDATE, [
    username,
    params.id,
    params.password,
    params.lastname,
    params.firstname,
    params.middlename,
    params.description,
    params.flat,
    params.role,
    params.is_blocking,
    params.places,
    params.phone,
    params.car_number,
  ]);
};

/**
 * Удалить пользователя
 *
 * @param  {string} username
 * @param  {IdParams} params
 * @returns {IdResult}
 */
export const deleteUser = async (username: string, params: IdParams) =>
  ApiHelper.executeDbFunction<IdResult>(dbFunctions.DELETE, [
    username,
    params.id,
  ]);

/**
 * Обвновление личных данных пользователя
 *
 * @param  {string} username
 * @param  {PrivateUser} params
 * @returns {IdResult}
 */
export const privateUpdate = async (username: string, params: PrivateUser) =>
  ApiHelper.executeDbFunction<IdResult>(dbFunctions.PRIVATE_UPDATE, [
    username,
    params.id,
    params.password,
    params.lastname,
    params.firstname,
    params.middlename,
    params.phone,
  ]);
