import Bluebird from 'bluebird';
import PgPromise from 'pg-promise';
import DBMessage from '../models/DBMessage';
import ServerError from './ServerError';
import logger from './logger';
import diagnostics = require('./pgDiagnostics');

/**
 * Типы данных, доступные для хранения в БД
 *
 * @exports
 * @type {ParamType}
 */
export type ParamType =
  | number
  | string
  | Date
  | boolean
  | null
  | undefined
  | number[];

/**
 * Класс для работы с БД
 *
 * @exports
 * @class PgConnection
 */
class PgConnection {
  private pgPromise: PgPromise.IMain;
  private db?: PgPromise.IDatabase<{}>;

  constructor() {
    this.pgPromise = PgPromise({
      promiseLib: Bluebird,
      schema: ['auth', 'global', 'public', 'cat'],
    });

    this.db = undefined;
  }
  /**
   * Соединиться с БД
   * @param  {string} host
   * @param  {number} port
   * @param  {string} database
   * @param  {string} user
   * @param  {string} password
   */
  public connect = (
    host: string,
    port: number,
    database: string,
    user: string,
    password: string,
  ) => {
    this.db = this.pgPromise({
      host,
      port,
      database,
      user,
      password,
      keepAlive: true,
    });
  };

  /**
   * Закрыть соединение с БД
   */
  public close = async (): Promise<void> => {
    logger.info('Database Closed');
    if (this.db) {
      await this.db.$pool.end();
    }
    await this.pgPromise.end();
  };

  /**
   * Выполнить функцию в БД
   *
   * @template T
   * @param  {string} functionName
   * @param  {ParamType[]} params?
   * @returns {Promise<DBMessage<T>>}
   */
  public executeFunction = async <T>(
    functionName: string,
    params?: ParamType[],
  ): Promise<DBMessage<T>> => {
    let msgObject!: DBMessage<T>;
    if (!this.db) {
      throw new ServerError('Database is not connected');
    }
    await this.db
      .func(functionName, params)
      .then(async (data) => {
        msgObject = data[0] as DBMessage<T>;
      })
      .catch((error) => {
        throw error as ServerError;
      });
    return msgObject;
  };
}

export default new PgConnection();
