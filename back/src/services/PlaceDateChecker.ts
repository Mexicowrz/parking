import Connection from './PgConnection';
import UserPlaceUpdater from './UserPlaceUpdater';
import ApiHelper from '../helpers/ApiHelper';
import logger from './logger';

/**
 * Список функций в БД
 */
const dbFunctions = {
  CHECK_DATES: 'park.e_check_freeplace_dates',
};

/** время перепроверки состояния свободных мест */
const CHECK_TIMEOUT = 60 * 1000;

/**
 * Класс обновления состояния свободных мест в БД
 *
 * @export
 * @class PlaceDateChecker
 */
class PlaceDateChecker {
  myPlUpdater: UserPlaceUpdater;
  isCheckStarted: boolean;
  public constructor(myPlUpdater: UserPlaceUpdater) {
    this.myPlUpdater = myPlUpdater;
    this.isCheckStarted = false;
  }
  /**
   * Запустить проверку обновлений
   */
  public start = () => {
    if (!this.isCheckStarted) {
      this.isCheckStarted = true;
    }
  };

  private check = async () => {
    try {
      const placeObjects = await ApiHelper.executeDbFunction<number[]>(
        dbFunctions.CHECK_DATES,
        [],
      );
      if (placeObjects && placeObjects.length > 0) {
        this.myPlUpdater.changeManyPlace(placeObjects);
      }
    } catch (error) {
      logger.error('Place checker check error', error);
    }
    setTimeout(this.check, CHECK_TIMEOUT);
  };
}

export default PlaceDateChecker;
