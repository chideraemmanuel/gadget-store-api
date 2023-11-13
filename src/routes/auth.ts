import express from 'express';
import {
  loginUser,
  registerUser,
  resetOtp,
  verifyUser,
} from '../controllers/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyUser);
router.post('/otp/resend', resetOtp);
router.get('/user', resetOtp);

export default router;
