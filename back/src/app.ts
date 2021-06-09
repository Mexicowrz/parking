import 'reflect-metadata';
import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import catchErrors from './middlewares/catchErrors';
import routes from './routes';
import path from 'path';
import Pg from './services/PgConnection';
import Redis from './services/Redis';
import logger from './services/logger';
// tslint:disable-next-line:no-var-requires
require('longjohn');

import { API_VERSION } from './consts/api';
import version from './middlewares/version';

class App {
  private app: express.Express;

  public get server(): express.Express {
    return this.app;
  }

  constructor() {
    this.app = express();

    // midlewares
    this.app.use(version);
    this.app.use(
      cors({
        exposedHeaders: ['token'],
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'COPY'],
      }),
    );
    const options: cors.CorsOptions = {
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'X-Access-Token',
      ],
      credentials: true,
      methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
      origin: process.env.API_URL || '*',
      preflightContinue: false,
    };

    this.app.use(cors(options));
    // для rest api
    this.app.use(bodyParser.json({ limit: '50mb' }));
    // this.app.use(express.urlencoded({limit: '50mb'}));
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
      }),
    );
    this.app.use(catchErrors());

    this.app.use(`/api/v${API_VERSION}/`, routes);

    // для фронта
    this.app.use(express.static(__dirname + '../../../front/build/'));
    this.app.get('*', async (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(__dirname + '../../../front/build/index.html'));
    });
  }

  public connectServices(
    pgHost: string,
    pgPort: number,
    pgDb: string,
    pgUser: string,
    pgPassword: string,
    redisHost: string,
    redisPort: number,
  ) {
    Pg.connect(pgHost, pgPort, pgDb, pgUser, pgPassword);
    Redis.connect(redisHost, redisPort);
  }

  public async disconnectPg(): Promise<number> {
    let exitCode = 0;
    try {
      await Pg.close();
    } catch (e) {
      logger.error('Error in graceful shutdown PG', e);
      exitCode = 1;
    }
    return exitCode;
  }

  public async disconnectRedis(): Promise<number> {
    let exitCode = 0;
    try {
      await Redis.close();
    } catch (e) {
      logger.error('Error in graceful shutdown Redis', e);
      exitCode = 1;
    }
    return exitCode;
  }

  public async disconnectServices(): Promise<number> {
    let exitCode = 0;
    exitCode = await this.disconnectPg();
    exitCode = await this.disconnectRedis();
    return exitCode;
  }
}

export default new App();
