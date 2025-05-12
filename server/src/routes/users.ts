import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User, { IUser, UserRole } from '../models/User';
import { authMiddleware, adminAuthMiddleware, superAdminAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Admin only
router.get('/', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Regular admins can only see users
    // Superadmins can see all users including other admins
    const query = req.user?.role === 'admin' ? { role: 'user' } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
      
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Admin only
router.get('/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Regular admins cannot see other admins or superadmins
    if (req.user?.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
      return res.status(403).json({ message: 'Not authorized to access this user' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Admin for users, Superadmin for admins
router.put(
  '/:id',
  [
    adminAuthMiddleware,
    body('email', 'Please include a valid email').optional().isEmail(),
    body('name', 'Name is required if provided').optional().not().isEmpty(),
    body('role', 'Invalid role').optional().isIn(['superadmin', 'admin', 'user']),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check permissions
      // Regular admins can only update users
      if (req.user?.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
        return res.status(403).json({ message: 'Not authorized to update this user' });
      }
      
      // Only superadmins can promote to admin or superadmin
      if (req.body.role && (req.body.role === 'admin' || req.body.role === 'superadmin') && req.user?.role !== 'superadmin') {
        return res.status(403).json({ message: 'Not authorized to change user role to admin or superadmin' });
      }
      
      // Update user fields
      if (req.body.email) user.email = req.body.email;
      if (req.body.name) user.name = req.body.name;
      if (req.body.role) user.role = req.body.role as UserRole;
      
      await user.save();
      
      res.json({
        message: 'User updated',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Superadmin only
router.delete('/:id', superAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting the last superadmin
    if (user.role === 'superadmin') {
      const superadminCount = await User.countDocuments({ role: 'superadmin' });
      if (superadminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the only superadmin account' });
      }
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/change-password
// @desc    Change user password (for self)
// @access  Private
router.post(
  '/change-password',
  [
    authMiddleware,
    body('currentPassword', 'Current password is required').exists(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    try {
      const user = await User.findById(req.user?.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/users/reset-password/:id
// @desc    Reset user password (by admin)
// @access  Admin only
router.post(
  '/reset-password/:id',
  [
    adminAuthMiddleware,
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { newPassword } = req.body;
    
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Regular admins can only reset passwords for users
      if (req.user?.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
        return res.status(403).json({ message: 'Not authorized to reset password for this user' });
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router; 