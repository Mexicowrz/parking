import ApiHelper, {
  EmptyParams,
  IdResult,
  IdParams,
} from '../helpers/ApiHelper';
import { IsNumber, IsDateString } from 'class-validator';
import { Response } from 'express';
import UserPlaceUpdater from '../services/UserPlaceUpdater';

/**
 * Статус свободного места
 */
export enum PlaceStatus {
  FREE = 0,
  BUSY = 1,
}

/**
 * Данные места, выставляемые в свободное пользование
 *
 * @export
 * @class ToFreePlace
 */
export class ToFreePlace {
  /** id места */
  @IsNumber()
  id!: number;

  /** дата, с которой место становится свободным */
  @IsDateString()
  date_from!: string;

  /** дата, до которой место может быть занято другим пользователем */
  @IsDateString()
  date_to!: string;
}

/**
 * Данные для занимания свободного места
 *
 * @export
 * @class TakeFree
 */
export class TakeFree {
  /** id места */
  @IsNumber()
  id!: number;

  /** дата, до которой место будет занято */
  @IsDateString()
  date_to!: string;
}

/**
 * Место на парковке
 *
 * @export
 * @type Place
 */
export type Place = {
  /** id места */
  id: number;
  /** номер места */
  number: number;
};

/**
 * Стуктура хранения данных личных мест
 */
export type MyPlaceRes = {
  /** Response потока */
  res: Response;
  /** логин пользователя */
  username: string;
  /** список доступных мест пользователя */
  placeList: number[];
};

/**
 * Структуа хранения свободных мест
 */
export type FreePlaceRes = {
  /** Response потока */
  res: Response;
  /** логин пользователя */
  username: string;
};

/**
 * Структура хранения данных свободных мест
 */
export type FreePlace = {
  /** id места */
  place_id: number;
  /** дата, с которой место считается свободным */
  date_from?: Date;
  /** дата, до которой место считается свободным */
  date_to?: Date;
  /** id пользователя, занявшего место */
  customer_user_id: number;
  /** состояние места */
  status: PlaceStatus;
  /** дата, с которой пользователь занял место */
  customer_date_from?: Date;
  /** дата, до которой пользователь занял место */
  customer_date_to?: Date;
  /** логин пользователя - владельца места */
  username: string;
  /** № места */
  number: number;
};

/**
 * Структура хранения пользовательского места
 */
export type UserPlace = {
  /** id места */
  id: number;
  /** № места */
  number: number;
  /** в случае, если место выставлено в свободное пользование, заполняется данными об этом */
  free?: FreePlace;
};

/**
 * Список функций в БД для работы с местами
 */
const dbFunctions = {
  /** получить список всех мест */
  GET_ALL: 'park.e_get_all_places',
  /** назначить место свободным */
  SET_FREE: 'park.e_set_free_place',
  /** отозвать свое место */
  RESPOND: 'park.e_respond_place',
  /** занять свободное место */
  TAKE_FREE: 'park.e_take_free_place',
  /** освободить занятое место */
  RELEASE_FREE: 'park.e_release_free_place',
  /** получить список пользовательских мест */
  GET_USER_PLACE_LIST: 'park.e_get_user_places',
  /** получить список свободных мест */
  GET_FREE_PLACE_LIST: 'park.e_get_free_place_list',
};

/**
 * Получить все места
 *
 * @param  {string} username
 * @param  {EmptyParams} params
 * @returns {Place[]}
 */
export const allPlace = async (username: string, params: EmptyParams) =>
  ApiHelper.executeDbFunction<Place[]>(dbFunctions.GET_ALL, [username]);

/**
 * Функция высшего порядка, добавляющая логику обновления данных пользователей, подключенных через SSE
 *
 * @template P
 * @param {(username: string, params: P) => Promise<R>} fn
 * @returns {(username: string, params: P) => Promise<R>}
 */
const changePlaceHOF = <P extends { id: number }, R>(
  fn: (username: string, params: P) => Promise<R>,
) => {
  return async (username: string, params: P) => {
    const res = await fn(username, params);
    UserPlaceUpdater.Instance.changePlace(params.id);
    return res;
  };
};

/**
 * Назначить личное место свободным
 *
 * @param  {string} username
 * @param  {ToFreePlace} params
 * @returns {IdResult}
 */
export const myToFree = changePlaceHOF(
  async (username: string, params: ToFreePlace) =>
    ApiHelper.executeDbFunction<IdResult>(dbFunctions.SET_FREE, [
      username,
      params.id,
      params.date_from,
      params.date_to,
    ]),
);

/**
 * Отозвать личное место
 *
 * @param  {string} username
 * @param  {IdParams} params
 * @returns {IdResult}
 */
export const myRespond = changePlaceHOF(
  async (username: string, params: IdParams) =>
    ApiHelper.executeDbFunction<IdResult>(dbFunctions.RESPOND, [
      username,
      params.id,
    ]),
);

/**
 * Занять свободное место
 *
 * @param  {string} username
 * @param  {TakeFree} params
 * @returns {IdResult}
 */
export const takeFreePlace = changePlaceHOF(
  async (username: string, params: TakeFree) =>
    ApiHelper.executeDbFunction<IdResult>(dbFunctions.TAKE_FREE, [
      username,
      params.id,
      params.date_to,
    ]),
);

/**
 * Вернуть свободное место
 *
 * @param  {string} username
 * @param  {IdParams} params
 * @returns {IdResult}
 */
export const releaseFreePlace = changePlaceHOF(
  async (username: string, params: IdParams) =>
    ApiHelper.executeDbFunction<IdResult>(dbFunctions.RELEASE_FREE, [
      username,
      params.id,
    ]),
);

/**
 * Получить места пользователя
 *
 * @param  {string} username
 * @returns {UserPlace[]}
 */
export const getUserPlaceList = async (username: string) =>
  ApiHelper.executeDbFunction<UserPlace[]>(dbFunctions.GET_USER_PLACE_LIST, [
    username,
  ]);

/**
 * Получить сводобные места
 *
 * @param  {string} username
 * @returns {UserPlace[]}
 */
export const getFreePlaceList = async () =>
  ApiHelper.executeDbFunction<FreePlace[]>(dbFunctions.GET_FREE_PLACE_LIST, []);
