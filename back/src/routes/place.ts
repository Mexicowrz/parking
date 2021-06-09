import { Router } from 'express';
import { checkJwt } from '../middlewares/checkJwt';
import ApiHelper, {
  EmptyParams,
  IdResult,
  IdParams,
} from '../helpers/ApiHelper';
import UserPlaceUpdater from '../services/UserPlaceUpdater';

import {
  allPlace,
  Place,
  ToFreePlace,
  myToFree,
  myRespond,
  takeFreePlace,
  TakeFree,
  releaseFreePlace,
} from '../models/Place';

const router = Router();

router.route('/my').get([checkJwt], UserPlaceUpdater.Instance.addConnection);
router
  .route('/my/tofree')
  .post(
    [checkJwt],
    ApiHelper.req<ToFreePlace, IdResult>(ToFreePlace)(myToFree),
  );
router
  .route('/my/respond')
  .post([checkJwt], ApiHelper.req<IdParams, IdResult>(IdParams)(myRespond));

router
  .route('/free')
  .get([checkJwt], UserPlaceUpdater.Instance.addFreeConnection);
router
  .route('/free/take')
  .post([checkJwt], ApiHelper.req<TakeFree, IdResult>(TakeFree)(takeFreePlace));

router
  .route('/free/release')
  .post(
    [checkJwt],
    ApiHelper.req<IdParams, IdResult>(IdParams)(releaseFreePlace),
  );

router
  .route('/getall')
  .get([checkJwt], ApiHelper.req<EmptyParams, Place[]>(EmptyParams)(allPlace));

export default router;
