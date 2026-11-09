import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDBConnected } from '../config/db.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'modotech_secret_key_2026';

const isAdminEmail = (email) => {
  const clean = (email || '').trim().toLowerCase();
  return clean === 'saidulhimuu@gmail.com' || clean === 'admin@modotech.com';
};

// In-memory fallback users
let memoryUsers = [
  {
    _id: 'admin_saidul',
    name: 'Saidul Himu (Super Admin)',
    email: 'saidulhimuu@gmail.com',
    password: '',
    role: 'admin',
  },
  {
    _id: 'admin_default',
    name: 'ModoTech Admin',
    email: 'admin@modotech.com',
    password: '', // admin
    role: 'admin',
  },
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (isDBConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: isAdminEmail(email) ? 'admin' : 'user',
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = newUser.toObject();

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: userWithoutPassword,
      });
    }

    // In-memory fallback
    const exists = memoryUsers.find((u) => u.email === email);
    if (exists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const newUser = {
      _id: `u_${Date.now()}`,
      name,
      email,
      role: isAdminEmail(email) ? 'admin' : 'user',
    };
    memoryUsers.push(newUser);

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    if (isDBConnected()) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (isAdminEmail(user.email) && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user.toObject();

      return res.json({
        message: 'Login successful',
        token,
        user: userWithoutPassword,
      });
    }

    // In-memory fallback
    const role = isAdminEmail(email) ? 'admin' : (email.toLowerCase().includes('admin') ? 'admin' : 'user');
    const user = {
      _id: `u_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: email.split('@')[0],
      email,
      role,
    };

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/auth/google
// @desc    Login or register via Google OAuth
// @access  Public
router.post('/google', async (req, res) => {
  const { name, email, avatar } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Google account email is required' });
    }

    if (isDBConnected()) {
      let user = await User.findOne({ email });

      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-10);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        user = new User({
          name: name || email.split('@')[0],
          email,
          password: hashedPassword,
          avatar: avatar || '',
          role: email === 'saidulhimuu@gmail.com' ? 'admin' : 'user',
        });

        await user.save();
      }

      if (isAdminEmail(user.email) && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user.toObject();

      return res.json({
        message: 'Google authentication successful',
        token,
        user: userWithoutPassword,
      });
    }

    // In-memory fallback
    const role = email === 'saidulhimuu@gmail.com' ? 'admin' : 'user';
    const user = {
      _id: `u_google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: name || email.split('@')[0],
      email,
      avatar: avatar || '',
      role,
    };

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: 'Google authentication successful',
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during Google auth', error: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (isDBConnected()) {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }

    return res.json({
      _id: req.user.id,
      name: 'Authenticated User',
      email: req.user.email || 'user@modotech.com',
      role: req.user.role || 'user',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (name, phone, avatar, address, password)
// @access  Private
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, avatar, address, password } = req.body;

    if (isDBConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (name) user.name = name;
      if (avatar !== undefined) user.avatar = avatar;
      if (phone) user.phone = phone;
      if (address) user.addresses = [address];

      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      await user.save();
      const { password: _, ...userWithoutPassword } = user.toObject();
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: userWithoutPassword,
      });
    }

    // In-memory fallback
    const updatedUser = {
      _id: req.user.id,
      name: name || 'User',
      email: req.user.email || 'user@modotech.com',
      avatar: avatar !== undefined ? avatar : '',
      phone: phone || '',
      address: address || null,
      role: req.user.role || 'user',
    };

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating profile', error: err.message });
  }
});

export default router;
