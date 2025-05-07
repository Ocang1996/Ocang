import express from 'express';
import { body, validationResult } from 'express-validator';
import Employee, { IEmployee } from '../models/Employee.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employees
// @desc    Create a new employee
// @access  Private
router.post(
  '/',
  [
    authMiddleware,
    body('nip', 'NIP is required').not().isEmpty(),
    body('name', 'Name is required').not().isEmpty(),
    body('gender', 'Gender is required').isIn(['male', 'female']),
    body('birthDate', 'Birth date is required').isISO8601(),
    body('joinDate', 'Join date is required').isISO8601(),
    body('employeeType', 'Employee type is required').isIn(['pns', 'p3k', 'nonAsn']),
    body('workUnit', 'Work unit is required').not().isEmpty(),
    body('position', 'Position is required').not().isEmpty(),
    body('educationLevel', 'Education level is required').isIn(['sd', 'smp', 'sma', 'd1', 'd2', 'd3', 'd4', 's1', 's2', 's3']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if employee with NIP already exists
      const existingEmployee = await Employee.findOne({ nip: req.body.nip });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Employee with this NIP already exists' });
      }

      const newEmployee = new Employee(req.body);
      const employee = await newEmployee.save();
      
      res.status(201).json(employee);
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/employees/:id
// @desc    Update an employee
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // If NIP is being changed, check if it already exists for another employee
    if (req.body.nip && req.body.nip !== employee.nip) {
      const existingEmployee = await Employee.findOne({ nip: req.body.nip });
      if (existingEmployee && existingEmployee._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Employee with this NIP already exists' });
      }
    }
    
    // Update employee fields
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete an employee
// @access  Private (superadmin and admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user has admin or superadmin role
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete employees' });
    }
    
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    await Employee.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Employee removed' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 