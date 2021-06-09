import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для переноса данных из различных источников в тело запроса (например, из params, query или headers)
 *
 * @export
 * @param  {(req:Request)=>object} fnConverter
 * @returns {(req: Request, res: Response: next: NextFunction)}
 */
export const convertParamsToBody =
  (fnConverter: (req: Request) => object) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = {
      ...fnConverter(req),
      ...req.body,
    };
    next();
  };

const convertIdToNumber = (req: Request) => ({
  id: parseInt(req.params.id, 10),
});

/**
 * Перенести ID из параметров в тело запроса
 *
 * @returns {(req: Request, res: Response: next: NextFunction)}
 */
export const idToBody = convertParamsToBody(convertIdToNumber);
