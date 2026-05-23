import express from 'express';
import {
  createBoard,
  getUserBoards,
  getBoardById,
  addPinToBoard,
  removePinFromBoard,
  deleteBoard
} from '../controllers/boardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createBoard);

router.route('/:id')
  .get(getBoardById)
  .delete(protect, deleteBoard);

router.get('/user/:userId', getUserBoards);

router.route('/:id/pin/:pinId')
  .post(protect, addPinToBoard)
  .delete(protect, removePinFromBoard);

export default router;
