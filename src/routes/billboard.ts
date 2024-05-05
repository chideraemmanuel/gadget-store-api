import express from 'express';
import {
  createBillboard,
  deleteBillboard,
  getBillboards,
  getSingleBillboard,
  updateBillboard,
} from '../controllers/billboard';

const router = express.Router();

router.get('/', getBillboards);
router.get('/:id', getSingleBillboard);
router.post('/', createBillboard);
router.put('/:id', updateBillboard);
router.delete('/:id', deleteBillboard);

export default router;
