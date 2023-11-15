import express from 'express';
import {
  loginAdmin,
  // getUser,
  loginUser,
  logoutUser,
  registerUser,
  resetOtp,
  verifyUser,
} from '../controllers/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/login/admin', loginAdmin);
router.post('/verify', verifyUser);
router.post('/otp/resend', resetOtp);
// router.get('/user', getUser);

export default router;
