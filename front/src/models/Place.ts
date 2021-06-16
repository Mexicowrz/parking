import { useRequest } from 'hooks/useRequest';
export type { IdResult, IdParams } from './Common';

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
 * Статус свободного места
 */
export enum PlaceStatus {
  FREE = 0,
  BUSY = 1,
}

/**
 * Данные свободного места
 *
 * @export
 * @type Place
 */
export type FreePlace = {
  /** id места */
  place_id: number;
  /** дата, с которй место считается свободным */
  date_from: Date;
  /** дата, с которй место перестает быть свободным */
  date_to: Date;
  /** id пользователя, занявшего место (гостя) */
  customer_user_id: number;
  /** статус свободного место */
  status: PlaceStatus;
  /** дата, с которой гость занял место */
  customer_date_from: Date;
  /** дата, до которой гость занял место */
  customer_date_to: Date;
  /** параметры гостя */
  user?: {
    firstname?: string;
    lastname?: string;
    middlename?: string;
  };
  /** логин гостя */
  username?: string;
  /** № места */
  number?: number;
};

/**
 * Место, которым может распоряжаться текущий пользователь
 *
 * @export
 * @type Place
 */
export type MyPlace = Place & {
  free: FreePlace;
};

/**
 * Данные места, выставляемые в свободное пользование
 *
 * @export
 * @type ToFreePlace
 */
export type ToFreePlace = {
  /** id места */
  id: number;
  /** дата, с которой место становится свободным */
  date_from: string;
  /** дата, до которой место может быть занято другим пользователем */
  date_to: string;
};

/**
 * Данные для занимания свободного места
 *
 * @export
 * @type TakeFree
 */
export type TakeFree = {
  /** id места */
  id: number;

  /** дата, до которой место будет занято */
  date_to: string;
};

/** Параметры запроса на получение всех сообщений */
export const REQ_ALL_PLACES_PARAMS: Parameters<typeof useRequest> = [
  'place/getall',
];

/** Параметры запроса на отзыв личного места */
export const REQ_RESPOND_PLACE_PARAMS: Parameters<typeof useRequest> = [
  'place/my/respond',
  'POST',
];

/** Параметры запроса на перевод личного места в свободные */
export const REQ_TO_FREE_PLACE_PARAMS: Parameters<typeof useRequest> = [
  'place/my/tofree',
  'POST',
];

/** Параметры запроса на освобождение свободного места */
export const REQ_RELEASE_FREE_PLACE_PARAMS: Parameters<typeof useRequest> = [
  'place/free/release',
  'POST',
];

/** Параметры запроса на занятие свободного места */
export const REQ_TAKE_FREE_PLACE_PARAMS: Parameters<typeof useRequest> = [
  'place/free/take',
  'POST',
];

/** URL SSE запроса на прослушивание изменений личных мест пользователя */
export const SSE_MYPLACES_URL: string = 'place/my';

/** URL SSE запроса на прослушивание изменений списка свободных мест */
export const SSE_FREEPLACE_URL: string = 'place/free';
