import express from 'express';
import {
  getCurrentAdmin,
  loginAdmin,
  // getUser,
  loginUser,
  logoutAdmin,
  logoutUser,
  registerUser,
  resetOtp,
  verifyUser,
} from '../controllers/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/admin/login', loginAdmin);
router.get('/admin/logout', logoutAdmin);
router.get('/admin', getCurrentAdmin);
router.post('/verify', verifyUser);
router.post('/otp/resend', resetOtp);
// router.get('/user', getUser);

export default router;
