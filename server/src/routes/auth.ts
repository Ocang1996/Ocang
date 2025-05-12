import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User, { IUser } from '../models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (admin access)
// @access  Public
router.post(
  '/register',
  [
    body('username', 'Username is required').not().isEmpty().trim().escape(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('name', 'Name is required').not().isEmpty().trim(),
    body('role', 'Invalid role').isIn(['superadmin', 'admin', 'user']),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email, name, role } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ $or: [{ email }, { username }] });

      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      user = new User({
        username,
        password,
        email,
        name,
        role,
      });

      await user.save();

      // Create and sign JWT token
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'defaultsecret',
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({ token });
        }
      );
    } catch (error) {
      console.error('Error in user registration:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/auth/register-public
// @desc    Register a new user with default 'user' role
// @access  Public
router.post(
  '/register-public',
  [
    body('username', 'Username harus diisi').not().isEmpty().trim().escape(),
    body('password', 'Password minimal 6 karakter').isLength({ min: 6 }),
    body('email', 'Format email tidak valid').isEmail().normalizeEmail(),
    body('name', 'Nama harus diisi').not().isEmpty().trim(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email, name } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ $or: [{ email }, { username }] });

      if (user) {
        if (user.username === username) {
          return res.status(400).json({ message: 'Username sudah digunakan' });
        } else {
          return res.status(400).json({ message: 'Email sudah terdaftar' });
        }
      }

      // Create new user with default 'user' role
      user = new User({
        username,
        password,
        email,
        name,
        role: 'user',
      });

      await user.save();

      res.status(201).json({ 
        success: true, 
        message: 'Pendaftaran berhasil. Silakan login dengan akun Anda.' 
      });
    } catch (error) {
      console.error('Error in user registration:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('password', 'Password is required').exists(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create and sign JWT token
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'defaultsecret',
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: user.id,
              username: user.username,
              name: user.name,
              email: user.email,
              role: user.role
            }
          });
        }
      );
    } catch (error) {
      console.error('Error in user login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send reset password link to email
// @access  Public
router.post(
  '/forgot-password',
  [body('email', 'Format email tidak valid').isEmail().normalizeEmail()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'Email tidak ditemukan' });
      }
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpire = Date.now() + 1000 * 60 * 60; // 1 jam
      // Simpan token dan expire ke user (tambahkan field jika belum ada)
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = resetTokenExpire;
      await user.save();
      // Kirim email
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password ASN Dashboard',
        text: `Klik link berikut untuk reset password: ${resetUrl}`,
      };
      await transporter.sendMail(mailOptions);
      return res.json({ success: true, message: 'Link reset password telah dikirim ke email Anda.' });
    } catch (error) {
      console.error('Error in forgot-password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 