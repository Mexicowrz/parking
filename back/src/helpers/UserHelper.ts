import Redis from '../services/Redis';
import type { UserData } from '../models/Auth';

/**
 * Набор методов для работы с данными пользователей
 *
 * @export
 * @class UserHelper
 */
export default class UserHelper {
  /**
   * Добавить пользовательские данные в кэш
   *
   * @param  {UserData} user
   */
  static addUserToCache = async (user: UserData) => {
    if (Redis.asyncSet) {
      await Redis.asyncSet(
        `user.${user.username}`,
        JSON.stringify(user),
        'EX',
        +(process.env['TOKEN_EXPIRES'] || 1) * 60 * 60, // кэшируем юзера на час
      );
    }
  };

  /**
   * Удалить пользовательские данные из кэша
   *
   * @param  {UserData} user
   */
  static deleteUserFromCache = async (user: UserData) => {
    if (Redis.asyncDel) {
      await Redis.asyncDel(`user.${user.username}`);
    }
  };

  /**
   * Очистить кэш от пользовательских данных
   */
  static deleteAllUsersFromCache = async () => {
    const users = await Redis.asyncKeys!('user.*');
    for (const u of users) {
      await Redis.asyncDel!(u);
    }
  };
}
