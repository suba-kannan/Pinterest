import Board from '../model/Board.js';
import User from '../model/User.js';
import Pin from '../model/Pin.js';

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
export const createBoard = async (req, res) => {
  try {
    const { name, description, isSecret } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Board name is required' });
    }

    const board = await Board.create({
      name,
      description: description || '',
      isSecret: isSecret || false,
      user: req.user._id
    });

    res.status(201).json(board);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's boards
// @route   GET /api/boards/user/:userId
// @access  Public
export const getUserBoards = async (req, res) => {
  try {
    const boards = await Board.find({ user: req.params.userId }).populate('pins', 'image title');
    res.json(boards);
  } catch (error) {
    console.error('Get user boards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get board by ID
// @route   GET /api/boards/:id
// @access  Public/Private (if secret)
export const getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('user', 'username profileImage')
      .populate({
        path: 'pins',
        populate: { path: 'user', select: 'username profileImage' }
      });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Secret boards are only accessible to their owner
    if (board.isSecret && (!req.user || req.user._id.toString() !== board.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied to this secret board' });
    }

    res.json(board);
  } catch (error) {
    console.error('Get board by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add pin to a board
// @route   POST /api/boards/:id/pin/:pinId
// @access  Private
export const addPinToBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const pin = await Pin.findById(req.params.pinId);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    if (board.pins.includes(pin._id)) {
      return res.status(400).json({ message: 'Pin already in board' });
    }

    board.pins.push(pin._id);
    await board.save();

    // Also add to user's general savedPins if not already there
    const user = await User.findById(req.user._id);
    if (!user.savedPins.includes(pin._id)) {
      user.savedPins.push(pin._id);
      await user.save();
    }

    res.json({ message: 'Pin added to board successfully', board });
  } catch (error) {
    console.error('Add pin to board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove pin from board
// @route   DELETE /api/boards/:id/pin/:pinId
// @access  Private
export const removePinFromBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    board.pins = board.pins.filter(id => id.toString() !== req.params.pinId);
    await board.save();

    res.json({ message: 'Pin removed from board successfully', board });
  } catch (error) {
    console.error('Remove pin from board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a board
// @route   DELETE /api/boards/:id
// @access  Private
export const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await board.deleteOne();
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
