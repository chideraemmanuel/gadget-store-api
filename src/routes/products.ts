import express from 'express';
import {
  addProduct,
  deleteProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
} from '../controllers/products';
import { authenticate, authorize } from '../middlewares/auth';
// import upload from '../config/multer';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getSingleProduct);
// router.post('/', upload.single('main_image'), addProduct);
router.post('/', authenticate, authorize, addProduct);
router.put('/:id', authenticate, authorize, updateProduct);
router.delete('/:id', authenticate, authorize, deleteProduct);

export default router;

// export default () => {
//   router.get('/', getProducts);

//   return router;
// };
