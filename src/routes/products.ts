import express from 'express';
import { addProduct, getProducts } from '../controllers/products';

const router = express.Router();

router.get('/', getProducts);
router.post('/', addProduct);

export default router;

// export default () => {
//   router.get('/', getProducts);

//   return router;
// };
