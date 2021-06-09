import { Router } from 'express';
import { checkJwt } from '../middlewares/checkJwt';
import { idToBody } from '../middlewares/converParams';
import ApiHelper, {
  EmptyParams,
  IdResult,
  IdParams,
} from '../helpers/ApiHelper';
import {
  Message,
  getVisible,
  listMessage,
  addMessage,
  updateMessage,
  deleteMessage,
} from '../models/Message';

const router = Router();
router
  .route('/get')
  .get(
    [checkJwt],
    ApiHelper.req<EmptyParams, Message[]>(EmptyParams)(getVisible),
  );
router
  .route('/list')
  .get(
    [checkJwt],
    ApiHelper.req<EmptyParams, Message[]>(EmptyParams)(listMessage),
  );
router
  .route('/add')
  .post([checkJwt], ApiHelper.req<Message, IdResult>(Message)(addMessage));

router
  .route('/:id')
  .patch(
    [checkJwt, idToBody],
    ApiHelper.req<Message, IdResult>(Message)(updateMessage),
  )
  .delete(
    [checkJwt, idToBody],
    ApiHelper.req<IdParams, IdResult>(IdParams)(deleteMessage),
  );

export default router;
