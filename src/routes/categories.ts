import express from 'express';
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../controllers/categories';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

router.get('/', getCategories);
router.post('/', authorize, addCategory);
router.put('/:id', authorize, updateCategory);
router.delete('/:id', authorize, deleteCategory);

export default router;
