import { nanoid } from 'nanoid';
import { Request, Response } from 'express';
import { transformAndValidate, ClassType } from 'class-transformer-validator';
import { IsNumber, ValidationError } from 'class-validator';
import ServerError from '../services/ServerError';
import { UNAUTHORIZED } from '../consts/apiErrors';
import Connection, { ParamType as DBParamType } from '../services/PgConnection';
import logger from '../services/logger';
import ErrorMessage from '../models/ErrorMessage';

/**
 * Пустые параметры - используется для запросов с пустыми параметрами
 *
 * @export
 * @class EmptyParams
 */
export class EmptyParams {}

/**
 * Пустой результат - используется для запросов, которые ничего не возвращают
 *
 * @export
 * @type EmtpyResult
 */
export type EmtpyResult = {};

/**
 * Параметры с идентификатором - используется для запросов с единственным параметров - идентификатором
 *
 * @export
 * @class IdParams
 */
export class IdParams {
  @IsNumber()
  id!: number;
}

/**
 * Результат с идентификатором - используется для запросов, которые возвращают только идентификатор
 *
 * @export
 * @type IdResult
 */
export type IdResult = {
  id: number;
};

/**
 * Набор методов для обработки пользовательских запросов через API
 *
 * @export
 * @class ApiHelper
 */
export default class ApiHelper {
  /**
   * Отправить успешный результат
   *
   * @param  {Response} res
   * @param  {number} status
   */
  static sendSuccess =
    <T>(res: Response, status: number) =>
    (data: T) => {
      res.status(status).type('application/json').json(data);
    };
  /**
   * Собрать ошибки валидации из исключения
   *
   * @param  {ValidationError[]} errors
   * @returns {string[]}
   */
  public static getValidationErrors = (errors: ValidationError[]): string[] => {
    const allerrs: string[] = [];
    const extractErrors = (err: ValidationError) => {
      if (err.constraints) {
        allerrs.push(...Object.values(err.constraints || []));
      }
      if (err.children) {
        for (const e of err.children) {
          extractErrors(e);
        }
      }
    };
    for (const err of errors) extractErrors(err);
    return allerrs;
  };

  /**
   * Отправить ошибку
   *
   * @param  {Response} res
   * @param  {number} status?
   * @param  {string} message?
   */
  public static sendError =
    (res: Response, status?: number, message?: string) =>
    (error: ServerError | ValidationError[]) => {
      let errStatus: number = 500;
      let key: string;
      let msg: string[];
      if (Array.isArray(error)) {
        key = nanoid();
        msg = ApiHelper.getValidationErrors(error);
      } else {
        errStatus = error.status || 500;
        key = error.key || nanoid();
        msg = [message || error.message];
      }
      res
        .status(status || errStatus)
        .json(
          new ErrorMessage(
            key,
            msg,
            Array.isArray(error) ? undefined : error.data,
          ),
      );
      logger.error('Api error', error);
    };

  /**
   * Сгеренировать исключение с указанной ошибкой и данными
   *
   * @param  {number} status
   * @param  {string} errorMessage
   * @param  {any} data?
   */
  public static throwError =
    (status: number, errorMessage: string, data?: any) =>
    (error?: ServerError) => {
      if (!error)
        error = new ServerError(
          errorMessage || UNAUTHORIZED,
          status || 500,
          data,
        );
      throw error;
    };

  /**
   * Выполнить функцию в БД.
   *
   * @template T
   * @param  {string} funcName
   * @param  {DBParamType[]} params?
   * @returns {Promise<T>}
   */
  public static executeDbFunction = async <T>(
    funcName: string,
    params?: DBParamType[],
  ): Promise<T> => {
    const msgObject = await Connection.executeFunction<T>(funcName, params);
    if (!msgObject.isok) {
      ApiHelper.throwError(msgObject.errorcode || 400, msgObject.message!)();
    }
    return msgObject.data;
  };

  /**
   * Получить функцию-обработчик запросов
   *
   * @template InputT, OutputT
   * @param  {ClassType<InputT>} inputClass
   * @returns {function(processWorker: {((data: InputT) => Promise<OutputT>)| (username: string, data: InputT) => Promise<OutputT>)}): (req: Request, res: Response) => Promise<void> }
   */
  public static req = <InputT extends object, OutputT>(
    inputClass: ClassType<InputT>,
  ) => {
    const getParamsFromQuery = async (req: Request): Promise<InputT> => {
      return (await transformAndValidate<InputT>(inputClass, {
        ...req.query,
        ...req.body,
      })) as InputT;
    };

    const getParamsFromBody = async (req: Request): Promise<InputT> => {
      return (await transformAndValidate<InputT>(
        inputClass,
        req.body,
      )) as InputT;
    };

    const apiRequest = async (
      processWorker:
        | ((data: InputT) => Promise<OutputT>)
        | ((username: string, data: InputT) => Promise<OutputT>),
      req: Request,
      res: Response,
    ) => {
      try {
        const getParameters =
          req.method === 'GET' ? getParamsFromQuery : getParamsFromBody;
        const paramsData = await getParameters(req);
        const worker =
          processWorker.length > 1
            ? (
                processWorker as (
                  username: string,
                  data: InputT,
                ) => Promise<OutputT>
              ).bind(null, res.locals.jwtPayload.username)
            : (processWorker as (data: InputT) => Promise<OutputT>);
        ApiHelper.sendSuccess(res, 200)(await worker(paramsData));
      } catch (error) {
        ApiHelper.sendError(res)(error);
      }
    };

    return (
      processWorker:
        | ((data: InputT) => Promise<OutputT>)
        | ((username: string, data: InputT) => Promise<OutputT>),
    ) => apiRequest.bind(null, processWorker);
  };
}
