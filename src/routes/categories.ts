import express from 'express';
import { addCategory, getCategories } from '../controllers/categories';

const router = express.Router();

router.get('/', getCategories);
router.post('/', addCategory);

export default router;
