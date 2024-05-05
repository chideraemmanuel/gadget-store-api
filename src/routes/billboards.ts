import express from 'express';
import {
  createBillboard,
  deleteBillboard,
  getBillboards,
  getSingleBillboard,
  updateBillboard,
} from '../controllers/billboards';
import { authorize } from '../middlewares/auth';

const router = express.Router();

router.get('/', getBillboards);
router.get('/:id', getSingleBillboard);
router.post('/', authorize, createBillboard);
router.put('/:id', authorize, updateBillboard);
router.delete('/:id', authorize, deleteBillboard);

export default router;
