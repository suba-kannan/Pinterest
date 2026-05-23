import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  getUserPublicProfile,
  updateProfile,
  toggleFollowUser
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.get('/profile/:userId', getUserPublicProfile);
router.put('/profile', protect, upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), updateProfile);
router.post('/follow/:followId', protect, toggleFollowUser);

export default router;
