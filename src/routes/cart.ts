import express from 'express';
import {
  addToCart,
  decrementItem,
  getUserCart,
  incrementItem,
  removeFromCart,
} from '../controllers/cart';

const router = express.Router();

router.get('/', getUserCart);
router.post('/', addToCart);
router.delete('/', removeFromCart);
router.put('/increment', incrementItem);
router.put('/decrement', decrementItem);

export default router;
