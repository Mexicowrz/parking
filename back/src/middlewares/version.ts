import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для добавления версии ПО в ответ всех запросов
 *
 * @param  {Request} req
 * @param  {Response} res
 * @param  {NextFunction} next
 */
export default (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('build', process.env['build'] || 'dev');
  next();
};
