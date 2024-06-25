import express from 'express';
import {
  getCurrentAdmin,
  initiatePasswordReset,
  loginAdmin,
  // getUser,
  loginUser,
  logoutAdmin,
  logoutUser,
  registerUser,
  resendOtp,
  resetPassword,
  verifyUser,
} from '../controllers/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.post('/admin/login', loginAdmin);
router.get('/admin/logout', logoutAdmin);
router.get('/admin', getCurrentAdmin);
router.post('/verify', verifyUser);
router.post('/otp/resend', resendOtp);
router.post('/reset-password/initiate', initiatePasswordReset);
router.post('/reset-password', resetPassword);
// router.get('/user', getUser);

export default router;
