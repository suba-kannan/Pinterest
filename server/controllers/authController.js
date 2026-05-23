import User from '../model/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check by username or email
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ]
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile (current user)
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get public profile of another user
// @route   GET /api/auth/profile/:userId
// @access  Public
export const getUserPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('username displayName profileImage coverImage bio location website socialLinks isVerified followers following');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.displayName = req.body.displayName !== undefined ? req.body.displayName : user.displayName;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.location = req.body.location !== undefined ? req.body.location : user.location;
      user.website = req.body.website !== undefined ? req.body.website : user.website;

      // Handle file uploads (avatar and banner)
      if (req.files) {
        if (req.files.profileImage) {
          user.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
        }
        if (req.files.coverImage) {
          user.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
        }
      } else if (req.file) {
        user.profileImage = `/uploads/${req.file.filename}`;
      }

      // Handle socials
      user.socialLinks = {
        instagram: req.body.instagram !== undefined ? req.body.instagram : (user.socialLinks?.instagram || ''),
        twitter: req.body.twitter !== undefined ? req.body.twitter : (user.socialLinks?.twitter || ''),
        pinterest: req.body.pinterest !== undefined ? req.body.pinterest : (user.socialLinks?.pinterest || '')
      };

      if (req.body.username && req.body.username !== user.username) {
        const usernameExists = await User.findOne({ username: req.body.username });
        if (usernameExists) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        coverImage: updatedUser.coverImage,
        bio: updatedUser.bio,
        location: updatedUser.location,
        website: updatedUser.website,
        socialLinks: updatedUser.socialLinks,
        isVerified: updatedUser.isVerified,
        followers: updatedUser.followers,
        following: updatedUser.following,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle follow/unfollow user
// @route   POST /api/auth/follow/:followId
// @access  Private
export const toggleFollowUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.followId);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== currentUser._id.toString()
      );
      await currentUser.save();
      await userToFollow.save();
      res.json({ followed: false, followersCount: userToFollow.followers.length });
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
      await currentUser.save();
      await userToFollow.save();
      res.json({ followed: true, followersCount: userToFollow.followers.length });
    }
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
