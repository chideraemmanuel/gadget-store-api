import express from 'express';
import { getBrands } from '../controllers/brands';

const router = express.Router();

router.get('/', getBrands);

export default router;
