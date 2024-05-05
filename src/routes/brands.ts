import express from 'express';
import {
  addBrand,
  deleteBrand,
  getBrands,
  getSingleBrand,
  updateBrand,
} from '../controllers/brands';
import { authorize } from '../middlewares/auth';

const router = express.Router();

router.get('/', getBrands);
router.get('/:id', getSingleBrand);
router.post('/', authorize, addBrand);
router.put('/:id', authorize, updateBrand);
router.delete('/:id', authorize, deleteBrand);

export default router;
