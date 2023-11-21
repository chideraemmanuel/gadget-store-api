import express from 'express';
import { getUser, getUserOrders, updateUser } from '../controllers/user';
import { verify } from '../middlewares/auth';

const router = express.Router();

router.get('/', getUser);
router.put('/update', verify, updateUser);
router.get('/orders', verify, getUserOrders);

export default router;
