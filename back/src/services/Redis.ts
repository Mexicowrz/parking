import { promisify } from 'util';
import logger from './logger';
import ServerError from './ServerError';
import { createClient, RedisClient, ClientOpts } from 'redis';

class Redis {
  private redisClient?: RedisClient;
  public asyncGet?: (key: string) => Promise<string | null>;
  public asyncKeys?: (key: string) => Promise<string[]>;
  public asyncSet?: (
    key: string,
    val: string,
    mode: string,
    duration: number,
  ) => Promise<unknown>;
  public asyncDel?: (key: string) => Promise<number>;

  public asyncQuit?: () => Promise<any>;

  public close = async () => {
    if (this.asyncQuit) {
      await this.asyncQuit();
      await new Promise((resolve) => setImmediate(resolve));
      logger.info('Redis closed');
    }
  };

  public connect = (host: string, port: number) => {
    const options: ClientOpts = {
      host,
      port,
      no_ready_check: true,
    };
    this.redisClient = createClient(options);

    this.redisClient.auth(String(process.env.REDIS_PASSWORD), (err) => {
      if (err) {
        throw err as ServerError;
      }
    });

    this.redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.redisClient.on('error', (err) => {
      throw err as ServerError;
    });

    this.asyncGet = promisify(this.redisClient.get).bind(this.redisClient);
    this.asyncKeys = promisify(this.redisClient.keys).bind(this.redisClient);
    this.asyncDel = promisify(this.redisClient.del).bind(this.redisClient);
    this.asyncSet = promisify(this.redisClient.set).bind(this.redisClient);
    this.asyncQuit = promisify(this.redisClient.quit).bind(this.redisClient);
  };
}

export default new Redis();
