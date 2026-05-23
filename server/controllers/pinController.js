import Pin from '../model/Pin.js';
import User from '../model/User.js';
import Board from '../model/Board.js';

// @desc    Create a new pin
// @route   POST /api/pins
// @access  Private
export const createPin = async (req, res) => {
  try {
    const { title, description, destinationUrl, category, tags, imageUrl } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let imagePath = '';
    let imagePaths = [];

    if (req.files) {
      if (req.files.image) {
        imagePath = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.images) {
        imagePaths = req.files.images.map(file => `/uploads/${file.filename}`);
      }
    } else if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    if (!imagePath && imageUrl) {
      imagePath = imageUrl;
    }

    if (!imagePath && imagePaths.length > 0) {
      imagePath = imagePaths[0];
    }

    if (!imagePath) {
      return res.status(400).json({ message: 'Image upload or URL is required' });
    }

    let tagsArray = [];
    if (tags) {
      try {
        tagsArray = JSON.parse(tags);
      } catch (e) {
        tagsArray = tags.split(',').map(tag => tag.trim().replace(/^#/, ''));
      }
    }

    const pin = await Pin.create({
      title,
      description: description || '',
      destinationUrl: destinationUrl || '',
      category: category || 'Others',
      image: imagePath,
      images: imagePaths,
      tags: tagsArray,
      user: req.user._id
    });

    res.status(201).json(pin);
  } catch (error) {
    console.error('Create pin error:', error);
    res.status(500).json({ message: 'Server error during pin creation' });
  }
};

// @desc    Get all pins (with filters, search, pagination)
// @route   GET /api/pins
// @access  Public
export const getAllPins = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 15 } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search) {
      const cleanSearch = search.trim().replace(/^#/, '');

      // Find users whose username/displayName matches the search term
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: cleanSearch, $options: 'i' } },
          { displayName: { $regex: cleanSearch, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { title: { $regex: cleanSearch, $options: 'i' } },
        { description: { $regex: cleanSearch, $options: 'i' } },
        { category: { $regex: cleanSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(cleanSearch, 'i')] } },
        ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : [])
      ];
    }

    const skipIndex = (page - 1) * limit;

    const pins = await Pin.find(query)
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skipIndex);

    const total = await Pin.countDocuments(query);

    res.json({
      pins,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasMore: skipIndex + pins.length < total
    });
  } catch (error) {
    console.error('Get all pins error:', error);
    res.status(500).json({ message: 'Server error fetching pins' });
  }
};

// @desc    Get pin by ID
// @route   GET /api/pins/:id
// @access  Public
export const getPinById = async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id)
      .populate('user', 'username displayName profileImage bio followers following')
      .populate('comments.user', 'username displayName profileImage')
      .populate('comments.replies.user', 'username displayName profileImage');

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Increment views
    pin.views = (pin.views || 0) + 1;
    await pin.save();

    // Fetch related pins in the same category, excluding the current pin
    const relatedPins = await Pin.find({
      category: pin.category,
      _id: { $ne: pin._id }
    })
      .populate('user', 'username displayName profileImage')
      .limit(10)
      .sort({ createdAt: -1 });

    res.json({
      pin,
      relatedPins
    });
  } catch (error) {
    console.error('Get pin by id error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Pin not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a pin
// @route   DELETE /api/pins/:id
// @access  Private
export const deletePin = async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Check if the user is the owner of the pin
    if (pin.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this pin' });
    }

    await pin.deleteOne();

    // Pull from saved pins for all users
    await User.updateMany(
      { savedPins: req.params.id },
      { $pull: { savedPins: req.params.id } }
    );

    res.json({ message: 'Pin deleted successfully' });
  } catch (error) {
    console.error('Delete pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle save/unsave pin
// @route   POST /api/pins/:id/save
// @access  Private
export const savePin = async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    const user = await User.findById(req.user._id);
    const isSaved = user.savedPins.includes(pin._id);

    if (isSaved) {
      // Unsave from general saved list
      user.savedPins = user.savedPins.filter(
        (id) => id.toString() !== pin._id.toString()
      );
      await user.save();

      // Also remove from any of this user's boards
      await Board.updateMany(
        { user: user._id, pins: pin._id },
        { $pull: { pins: pin._id } }
      );

      res.json({ saved: false, message: 'Pin unsaved successfully' });
    } else {
      // Save to general saved list
      user.savedPins.push(pin._id);
      await user.save();

      // Check if user has boards
      let board = await Board.findOne({ user: user._id }).sort({ updatedAt: -1 });
      if (!board) {
        // Automatically create a default board for the user
        board = await Board.create({
          name: 'Quick Saves',
          user: user._id,
          pins: [pin._id]
        });
      } else {
        // Add to the existing board if not already there
        if (!board.pins.map(id => id.toString()).includes(pin._id.toString())) {
          board.pins.push(pin._id);
          await board.save();
        }
      }

      res.json({ saved: true, message: 'Pin saved successfully', boardId: board._id });
    }
  } catch (error) {
    console.error('Save pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle like/unlike pin
// @route   POST /api/pins/:id/like
// @access  Private
export const likePin = async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    const isLiked = pin.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      pin.likes = pin.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      await pin.save();
      res.json({ liked: false, likesCount: pin.likes.length });
    } else {
      // Like
      pin.likes.push(req.user._id);
      await pin.save();
      res.json({ liked: true, likesCount: pin.likes.length });
    }
  } catch (error) {
    console.error('Like pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Comment on a pin
// @route   POST /api/pins/:id/comment
// @access  Private
export const commentPin = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    const newComment = {
      user: req.user._id,
      text
    };

    pin.comments.push(newComment);
    await pin.save();

    const updatedPin = await Pin.findById(req.params.id)
      .populate('comments.user', 'username profileImage');

    res.json(updatedPin.comments);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete comment from pin
// @route   DELETE /api/pins/:id/comment/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    const comment = pin.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check authorization: comment writer or pin owner
    if (
      comment.user.toString() !== req.user._id.toString() &&
      pin.user.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await pin.save();

    const updatedPin = await Pin.findById(req.params.id)
      .populate('comments.user', 'username profileImage');

    res.json(updatedPin.comments);
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pins created by user
// @route   GET /api/pins/user/:userId
// @access  Public
export const getUserPins = async (req, res) => {
  try {
    const pins = await Pin.find({ user: req.params.userId })
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 });
    res.json(pins);
  } catch (error) {
    console.error('Get user pins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's saved pins
// @route   GET /api/pins/saved/:userId
// @access  Public
export const getUserSavedPins = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: 'savedPins',
      populate: { path: 'user', select: 'username profileImage' }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.savedPins);
  } catch (error) {
    console.error('Get user saved pins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reply to a comment
// @route   POST /api/pins/:id/comment/:commentId/reply
// @access  Private
export const replyToComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    const comment = pin.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.replies.push({
      user: req.user._id,
      text
    });

    await pin.save();

    const updatedPin = await Pin.findById(req.params.id)
      .populate('comments.user', 'username profileImage')
      .populate('comments.replies.user', 'username profileImage');

    res.json(updatedPin.comments);
  } catch (error) {
    console.error('Reply comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

