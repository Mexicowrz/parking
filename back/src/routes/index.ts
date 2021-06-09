import { Router } from 'express';
import auth from './auth';
import message from './message';
import place from './place';
import user from './user';

const router = Router();

router.use('/auth', auth);
router.use('/message', message);
router.use('/user', user);
router.use('/place', place);

export default router;
