import { nanoid } from 'nanoid';
import logger from './logger';

/**
 * Класс ошибки сервера
 *
 * @exports
 * @class ServerError
 */
export default class ServerError extends Error {
  /** статус ошибки */
  public status: number;
  /** уникальный ключ ошибки */
  public key: string;
  /** сопутствующие данные */
  public data?: any;
  constructor(errorMessage?: string, status?: number, data?: any) {
    super(errorMessage);
    this.status = status || 500;
    this.key = nanoid();
    this.data = data;
    Object.setPrototypeOf(this, ServerError.prototype);
    Error.captureStackTrace(this, ServerError);
    logger.error('ServerError', this);
  }

  public toString = (): string => {
    return `${this.key} - ${this.message}`;
  };
}
