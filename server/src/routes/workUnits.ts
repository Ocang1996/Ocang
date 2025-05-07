import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import WorkUnit, { IWorkUnit } from '../models/WorkUnit.js';
import { authMiddleware, adminAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/work-units
// @desc    Get all work units
// @access  Private
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const workUnits = await WorkUnit.find()
      .sort({ level: 1, name: 1 })
      .populate('parentUnit', 'name code');
    
    res.json(workUnits);
  } catch (error) {
    console.error('Error fetching work units:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/work-units/:id
// @desc    Get work unit by ID
// @access  Private
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const workUnit = await WorkUnit.findById(req.params.id)
      .populate('parentUnit', 'name code');
    
    if (!workUnit) {
      return res.status(404).json({ message: 'Work unit not found' });
    }
    
    res.json(workUnit);
  } catch (error) {
    console.error('Error fetching work unit:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Work unit not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/work-units/children/:id
// @desc    Get all child units for a parent unit
// @access  Private
router.get('/children/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const childUnits = await WorkUnit.find({ parentUnit: req.params.id })
      .sort({ name: 1 });
    
    res.json(childUnits);
  } catch (error) {
    console.error('Error fetching child units:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/work-units/top-level
// @desc    Get all top-level work units
// @access  Private
router.get('/top-level', authMiddleware, async (req: Request, res: Response) => {
  try {
    const topLevelUnits = await WorkUnit.find({ level: 1 })
      .sort({ name: 1 });
    
    res.json(topLevelUnits);
  } catch (error) {
    console.error('Error fetching top-level units:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/work-units
// @desc    Create a new work unit
// @access  Admin only
router.post(
  '/',
  [
    adminAuthMiddleware,
    body('name', 'Name is required').not().isEmpty(),
    body('code', 'Code is required').not().isEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if code already exists
      const existingUnit = await WorkUnit.findOne({ code: req.body.code });
      if (existingUnit) {
        return res.status(400).json({ message: 'Work unit with this code already exists' });
      }

      // Check if parent unit exists
      if (req.body.parentUnit) {
        const parentUnit = await WorkUnit.findById(req.body.parentUnit);
        if (!parentUnit) {
          return res.status(400).json({ message: 'Parent work unit not found' });
        }
      }

      const newWorkUnit = new WorkUnit(req.body);
      const workUnit = await newWorkUnit.save();
      
      res.status(201).json(workUnit);
    } catch (error) {
      console.error('Error creating work unit:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/work-units/:id
// @desc    Update a work unit
// @access  Admin only
router.put('/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const workUnit = await WorkUnit.findById(req.params.id);
    
    if (!workUnit) {
      return res.status(404).json({ message: 'Work unit not found' });
    }
    
    // If code is being changed, check if it already exists
    if (req.body.code && req.body.code !== workUnit.code) {
      const existingUnit = await WorkUnit.findOne({ code: req.body.code });
      if (existingUnit && existingUnit._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Work unit with this code already exists' });
      }
    }
    
    // Check if parent unit exists
    if (req.body.parentUnit) {
      const parentUnit = await WorkUnit.findById(req.body.parentUnit);
      if (!parentUnit) {
        return res.status(400).json({ message: 'Parent work unit not found' });
      }
      
      // Prevent circular references
      if (req.body.parentUnit === req.params.id) {
        return res.status(400).json({ message: 'Cannot set unit as its own parent' });
      }
    }
    
    // Update work unit fields
    const updatedWorkUnit = await WorkUnit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(updatedWorkUnit);
  } catch (error) {
    console.error('Error updating work unit:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Work unit not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/work-units/:id
// @desc    Delete a work unit
// @access  Admin only
router.delete('/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const workUnit = await WorkUnit.findById(req.params.id);
    
    if (!workUnit) {
      return res.status(404).json({ message: 'Work unit not found' });
    }
    
    // Check if the work unit has child units
    const childUnitsCount = await WorkUnit.countDocuments({ parentUnit: req.params.id });
    if (childUnitsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete work unit with child units. Please delete or reassign child units first.' 
      });
    }
    
    await WorkUnit.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Work unit removed' });
  } catch (error) {
    console.error('Error deleting work unit:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Work unit not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/work-units/tree
// @desc    Get hierarchical tree of work units
// @access  Private
router.get('/tree', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get all work units
    const allUnits = await WorkUnit.find({ isActive: true }).sort({ level: 1, name: 1 });
    
    // Create a map of all units for easy lookup
    const unitsMap = new Map();
    allUnits.forEach(unit => {
      unitsMap.set(unit._id.toString(), {
        _id: unit._id,
        name: unit.name,
        code: unit.code,
        level: unit.level,
        children: []
      });
    });
    
    // Build the tree
    const tree = [];
    
    allUnits.forEach(unit => {
      const unitWithChildren = unitsMap.get(unit._id.toString());
      
      if (unit.parentUnit) {
        // This is a child unit
        const parentId = unit.parentUnit.toString();
        if (unitsMap.has(parentId)) {
          unitsMap.get(parentId).children.push(unitWithChildren);
        }
      } else {
        // This is a top-level unit
        tree.push(unitWithChildren);
      }
    });
    
    res.json(tree);
  } catch (error) {
    console.error('Error fetching work units tree:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 