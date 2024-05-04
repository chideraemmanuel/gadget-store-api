import express from 'express';
import { getBillboards, getSingleBillboard } from '../controllers/billboard';

const router = express.Router();

router.get('/', getBillboards);
router.get('/:id', getSingleBillboard);

export default router;
