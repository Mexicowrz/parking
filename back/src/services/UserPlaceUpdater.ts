import { Response, Request } from 'express';
import Connection from './PgConnection';
import ApiHelper from '../helpers/ApiHelper';
import logger from './logger';
import {
  MyPlaceRes,
  FreePlaceRes,
  UserPlace,
  getUserPlaceList,
  getFreePlaceList,
  FreePlace,
} from '../models/Place';
import PlaceDateChecker from './PlaceDateChecker';

class UserPlaceUpdater {
  private resList: MyPlaceRes[] = [];
  private freePlList: FreePlaceRes[] = [];

  private static single?: UserPlaceUpdater;

  private constructor() {
    /** запустить проверку свободных мест */
    new PlaceDateChecker(this).start();
  }

  /**
   * Получить экземпляр класса
   *
   * @returns UserPlaceUpdater
   */
  public static get Instance(): UserPlaceUpdater {
    if (!UserPlaceUpdater.single) {
      UserPlaceUpdater.single = new UserPlaceUpdater();
    }
    return UserPlaceUpdater.single;
  }

  /**
   * Добавить клиента для мониторинга личных мест
   *
   * @param  {Request} req
   * @param  {Response} res
   */
  public addConnection = async (req: Request, res: Response) => {
    try {
      res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
      });
      res.flushHeaders();
      res.write('retry: 1000\n\n');
      const username: string = res.locals.jwtPayload.username;
      logger.info('UserPlace SSE add connection', username);
      const placeObject = await getUserPlaceList(username);

      this.resList.push({
        placeList: (placeObject || []).map((el: { id: number }) => el.id),
        res,
        username,
      });
      res.on('close', () => {
        try {
          this.resList.splice(
            this.resList.findIndex((rs: MyPlaceRes) => rs.res === res),
            1,
          );
          logger.info('UserPlace SSE close connection', username);
        } catch (error) {
          logger.error('UserPlace add connection error', error);
        }
        res.end();
      });
      res.write(`data: ${JSON.stringify(placeObject)}\n\n`);
    } catch (error) {
      logger.error('UserPlace add connection error', error);
    }
  };

  /**
   * Добавить клиента для мониторинга свободных мест
   *
   * @param  {Request} req
   * @param  {Response} res
   */
  public addFreeConnection = async (req: Request, res: Response) => {
    try {
      res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
      });
      res.flushHeaders();
      res.write('retry: 1000\n\n');

      const username: string = res.locals.jwtPayload.username;
      logger.info('UserPlace SSE add free connection', username);
      const placeObject = await getFreePlaceList();
      this.freePlList.push({
        res,
        username,
      });
      res.on('close', () => {
        try {
          this.freePlList.splice(
            this.freePlList.findIndex((rs: FreePlaceRes) => rs.res === res),
            1,
          );
          logger.info('UserPlace SSE close free connection', username);
        } catch (error) {
          logger.error('UserPlace add free connection error', error);
        }
        res.end();
      });
      this.sendFreePlaceToUser(placeObject, username, res);
    } catch (error) {
      logger.error('UserPlace add free connection error', error);
    }
  };

  private sendFreePlaceToUser = (
    placeList: FreePlace[],
    username: string,
    res: Response,
  ) => {
    const dt = placeList.filter(
      (pl: FreePlace) => pl.username === username || pl.status === 0,
    );
    res.write(`data: ${JSON.stringify(dt)}\n\n`);
  };

  private massSendFreePlace = async () => {
    try {
      logger.info('UserPlace SSE add free connection');
      if (this.freePlList.length > 0) {
        const placeObject = await getFreePlaceList();
        this.freePlList.forEach((fp) => {
          this.sendFreePlaceToUser(placeObject, fp.username, fp.res);
        });
      }
    } catch (error) {
      logger.error('Mass send free place error', error);
    }
  };

  /**
   * Разослать всем заинтересованным событие о смене параметров места
   *
   * @param  {number} place_id
   */
  public changePlace = async (place_id: number) => {
    this.resList.forEach(async (resElem: MyPlaceRes) => {
      if (resElem.placeList.indexOf(place_id) >= 0) {
        const placeObject = await getUserPlaceList(resElem.username);
        resElem.res.write(`data: ${JSON.stringify(placeObject)}\n\n`);
      }
    });
    this.massSendFreePlace();
  };

  /**
   * Разослать сообщения о смене параметров списка мест
   *
   * @param  {number[]} place_ids
   */
  public changeManyPlace = async (place_ids: number[]) => {
    this.resList.forEach(async (resElem: MyPlaceRes) => {
      for (const place_id of place_ids) {
        if (resElem.placeList.indexOf(place_id) >= 0) {
          const placeObject = await getUserPlaceList(resElem.username);
          resElem.res.write(`data: ${JSON.stringify(placeObject)}\n\n`);
          break;
        }
      }
    });
    this.massSendFreePlace();
  };
}

export default UserPlaceUpdater;
