import { Router } from 'express';
import { checkJwt } from '../middlewares/checkJwt';
import { idToBody } from '../middlewares/converParams';
import ApiHelper, {
  EmptyParams,
  IdResult,
  IdParams,
} from '../helpers/ApiHelper';
import {
  UserForList,
  User,
  listUser,
  addUser,
  getUser,
  updateUser,
  deleteUser,
  privateUpdate,
  PrivateUser,
} from '../models/User';

const router = Router();

router
  .route('/list')
  .get(
    [checkJwt],
    ApiHelper.req<EmptyParams, UserForList[]>(EmptyParams)(listUser),
  );
router
  .route('/add')
  .post([checkJwt], ApiHelper.req<User, IdResult>(User)(addUser));

router
  .route('/lk/:id')
  .patch(
    [checkJwt, idToBody],
    ApiHelper.req<PrivateUser, IdResult>(PrivateUser)(privateUpdate),
  );

router
  .route('/:id')
  .get([checkJwt, idToBody], ApiHelper.req<IdParams, User>(IdParams)(getUser))
  .patch([checkJwt, idToBody], ApiHelper.req<User, IdResult>(User)(updateUser))
  .delete(
    [checkJwt, idToBody],
    ApiHelper.req<IdParams, IdResult>(IdParams)(deleteUser),
  );

export default router;
