import express from 'express';
import {
  addToCart,
  clearCart,
  decrementItem,
  getUserCart,
  incrementItem,
  removeFromCart,
} from '../controllers/cart';

const router = express.Router();

router.get('/', getUserCart);
router.put('/add', addToCart);
router.put('/remove', removeFromCart);
router.put('/increment', incrementItem);
router.put('/decrement', decrementItem);
router.put('/clear', clearCart);

export default router;
