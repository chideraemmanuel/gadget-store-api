import express from 'express';
import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../controllers/products';
import upload from '../config/multer';

const router = express.Router();

router.get('/', getProducts);
// router.post('/', upload.single('main_image'), addProduct);
router.post('/', addProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

// export default () => {
//   router.get('/', getProducts);

//   return router;
// };
