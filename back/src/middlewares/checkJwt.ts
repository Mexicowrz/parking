import { Request, Response, NextFunction } from 'express';
import ApiHelper from '../helpers/ApiHelper';
import { UNAUTHORIZED } from '../consts/apiErrors';
import { verify } from '../models/Auth';

/**
 * Middleware для проверки JWT токена авторизованных пользователей
 *
 * @export
 * @param  {Request} req
 * @param  {Response} res
 * @param  {NextFunction} next
 */
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  // проверяем токен
  try {
    // получить jwt токен из хедера
    const token = (req.headers['token'] || req.query['token']) as string;
    const { payload, newToken } = verify(token);

    res.locals.jwtPayload = payload;
    res.setHeader('token', newToken);
  } catch (error) {
    // если токен невалидный - возвращаем 401 (unauthorized)
    ApiHelper.sendError(res, 401, UNAUTHORIZED)(error);
    return;
  }
  next();
};
