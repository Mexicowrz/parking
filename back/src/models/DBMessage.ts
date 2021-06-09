/**
 * Структура данных, возвращаемая всеми внешними функциями БД
 *
 * @export
 * @template T
 * @class BDMessage
 */
export default class DBMessage<T>{
  /** флаг, определяющий успешность выполнения функции */
  isok!: boolean;
  /** сообщение в случае ошибки */
  message?: string;
  /** код ошибки в формате HTTP status code  */
  errorcode?: number;
  /** данные выполнения функции */
  data!: T;
}