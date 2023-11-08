import express from 'express';
import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../controllers/products';

const router = express.Router();

router.get('/', getProducts);
router.post('/', addProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

// export default () => {
//   router.get('/', getProducts);

//   return router;
// };
