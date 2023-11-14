import express from 'express';
import { getUser, updateUser } from '../controllers/user';
import { verify } from '../middlewares/auth';

const router = express.Router();

router.get('/', getUser);
router.put('/update', verify, updateUser);

export default router;
