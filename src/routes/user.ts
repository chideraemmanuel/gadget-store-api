import express from 'express';
import {
  cancelOrder,
  getSingleUserOrder,
  getUser,
  getUserOrders,
  placeOrder,
  updateUser,
} from '../controllers/user';
import { verify } from '../middlewares/auth';

const router = express.Router();

router.get('/', getUser);
router.put('/update', verify, updateUser);
router.get('/orders', verify, getUserOrders);
router.get('/orders/:orderId', verify, getSingleUserOrder);
router.post('/place-order', verify, placeOrder);
router.put('/cancel-order/:orderId', verify, cancelOrder);

export default router;
