import { Router } from 'express';
import { checkJwt } from '../middlewares/checkJwt';
import { login, Login, getUserInfo } from '../models/Auth';
import ApiHelper, { EmptyParams } from '../helpers/ApiHelper';
import { TokenMessage, UserData } from '../models/Auth';

const router = Router();

router.post('/login', ApiHelper.req<Login, TokenMessage>(Login)(login));
router
  .route('/current')
  .get(
    [checkJwt],
    ApiHelper.req<EmptyParams, UserData>(EmptyParams)(getUserInfo),
  );
export default router;
