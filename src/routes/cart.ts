import express from 'express';
import { addToCart, getUserCart } from '../controllers/cart';

const router = express.Router();

router.get('/', getUserCart);
router.post('/', addToCart);

export default router;
