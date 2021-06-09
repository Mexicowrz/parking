import { ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import ApiHelper from '../helpers/ApiHelper';
import ServerError from '../services/ServerError';

/**
 * Middleware для обработки общих неотловленных ошибок
 *
 * @export
 * @param  {ServerError|ValidationError} err
 * @param  {Request} req
 * @param  {Response} res
 * @param  {NextFunction} next
 */
export default () =>
  (
    err: ServerError | ValidationError,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    ApiHelper.sendError(res, 500)(err as ServerError);
  };
