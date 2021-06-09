import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import ApiHelper, {
  EmptyParams,
  IdParams,
  IdResult,
} from '../helpers/ApiHelper';

/**
 * Сообщения для пользователей приложением
 *
 * @export
 * @class
 */
export class Message {
  /** id сообщения */
  @IsNumber()
  @IsOptional()
  id!: number;

  /** текст сообщения */
  @IsString()
  message!: string;

  /** флаг фидимости сообщения */
  @IsBoolean()
  @IsOptional()
  is_visible!: boolean;

  /** тип сообщения (от менее информационного до критичного) */
  @IsNumber()
  type!: number;
}

/**
 * Список функций в БД для работы с сообщениями
 */
const dbFunctions = {
  /** получить список видимых сообщений */
  GET_VISIBLE: 'park.e_get_messages',
  /** получить список всех сообщений */
  GET_LIST: 'park.e_message_get_all',
  /** добавить сообщение */
  ADD: 'park.e_message_add',
  /** обновить сообщение */
  UPDATE: 'park.e_message_update',
  /** удалить сообщение */
  DELETE: 'park.e_message_delete',
};
/**
 * Получить список видимых сообщений
 *
 * @param  {string} username
 * @param  {EmptyParams} params
 * @returns {Message[]}
 */
export const getVisible = async (username: string, params: EmptyParams) =>
  ApiHelper.executeDbFunction<Message[]>(dbFunctions.GET_VISIBLE, [username]);

/**
 * Получить список всех сообщений
 *
 * @param  {string} username
 * @param  {EmptyParams} params
 * @returns {Message[]}
 */
export const listMessage = async (username: string, params: EmptyParams) =>
  ApiHelper.executeDbFunction<Message[]>(dbFunctions.GET_LIST, [username]);

/**
 * Добавить новое сообщение
 *
 * @param  {string} username
 * @param  {Message} params
 * @returns {IdResult}
 */
export const addMessage = async (username: string, params: Message) =>
  ApiHelper.executeDbFunction<IdResult>(dbFunctions.ADD, [
    username,
    params.message,
    params.is_visible,
    params.type,
  ]);

/**
 * Обновить сообщение
 *
 * @param  {string} username
 * @param  {Message} params
 * @returns {IdResult}
 */
export const updateMessage = async (username: string, params: Message) => {
  return ApiHelper.executeDbFunction<IdResult>(dbFunctions.UPDATE, [
    username,
    params.id,
    params.message,
    params.is_visible,
    params.type,
  ]);
};
/**
 * Удалить сообщение
 *
 * @param  {string} username
 * @param  {IdParams} params
 * @returns {IdResult}
 */
export const deleteMessage = async (username: string, params: IdParams) =>
  ApiHelper.executeDbFunction<IdResult>(dbFunctions.DELETE, [
    username,
    params.id,
  ]);
