import { useRequest } from 'hooks/useRequest';
export type { IdResult, IdParams } from './Common';


/**
 * Тип выводимого сообщения
 */
export enum MessageType {
  INFO = 0,
  WARNING = 1,
  ERROR = 2,
}

/**
 * Выводимое пользователям сообщение
 */
export type Message = {
  id: number;
  message: string;
  type: MessageType;
};

export type MessageElem = Message & {
  is_visible: boolean;
};

/**
 * Преобразовать тип сообщения в строку (для подствечивания сообщения нужным цветом)
 * @param  {MessageType} type
 * @returns {string}
 */
export const messageTypeToString = (
  type: MessageType,
): 'info' | 'warning' | 'error' => {
  switch (type) {
    case MessageType.WARNING:
      return 'warning';
    case MessageType.ERROR:
      return 'error';
  }
  return 'info';
};

/** Параметры запроса на получение видимых сообщений */
export const REQ_VISIBLE_MESSAGES_PARAMS: Parameters<typeof useRequest> = [
  'message/get',
];
/** Параметры запроса на получение всех сообщений */
export const REQ_ALL_MESSAGES_PARAMS: Parameters<typeof useRequest> = [
  'message/list',
];
/**
 * Функция получения запросов на сохранение/добавление сообщения
 * @param  {'add'|number} id
 * @returns Parameters
 */
export const makeSaveMessageParams = (
  id: 'add' | number,
): Parameters<typeof useRequest> =>
  id === 'add' ? ['message/add', 'POST'] : [`message/${id}`, 'PATCH'];

/**
 * Функция получения запросов на удаление сообщения
 * @param  {number} id
 * @returns Parameters
 */
export const makeDeleteMessageParams = (id: number): Parameters<typeof useRequest> => [`message/${id}`, 'DELETE'];
