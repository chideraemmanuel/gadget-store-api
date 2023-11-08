import express from 'express';
import {
  addProduct,
  getProducts,
  updateProduct,
} from '../controllers/products';

const router = express.Router();

router.get('/', getProducts);
router.post('/', addProduct);
router.put('/:id', updateProduct);

export default router;

// export default () => {
//   router.get('/', getProducts);

//   return router;
// };
