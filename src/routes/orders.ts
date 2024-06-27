import express from 'express';
import { getOrders, getSingleOrder, updateOrder } from '../controllers/orders';

const router = express.Router();

router.get('/', getOrders);
router.get('/:orderId', getSingleOrder);
router.put('/:orderId', updateOrder);

export default router;
