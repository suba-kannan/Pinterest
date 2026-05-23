import express from 'express';
import {
  createPin,
  getAllPins,
  getPinById,
  deletePin,
  savePin,
  likePin,
  commentPin,
  deleteComment,
  getUserPins,
  getUserSavedPins,
  replyToComment
} from '../controllers/pinController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), createPin)
  .get(getAllPins);

router.route('/:id')
  .get(getPinById)
  .delete(protect, deletePin);

router.post('/:id/save', protect, savePin);
router.post('/:id/like', protect, likePin);
router.post('/:id/comment', protect, commentPin);
router.post('/:id/comment/:commentId/reply', protect, replyToComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

router.get('/user/:userId', getUserPins);
router.get('/saved/:userId', getUserSavedPins);

export default router;
