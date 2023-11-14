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
router.post('/', authenticate, authorize, addCategory);
router.put('/:id', authenticate, authorize, updateCategory);
router.delete('/:id', authenticate, authorize, deleteCategory);

export default router;
