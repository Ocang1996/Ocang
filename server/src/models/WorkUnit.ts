import mongoose, { Document } from 'mongoose';

export interface IWorkUnit extends Document {
  name: string;
  code: string;
  description?: string;
  parentUnit?: mongoose.Types.ObjectId;
  level: number; // 1: top level, 2: second level, etc.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workUnitSchema = new mongoose.Schema<IWorkUnit>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkUnit',
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Set level automatically based on parent
workUnitSchema.pre('save', async function(this: IWorkUnit, next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (this.parentUnit) {
    // Find the parent unit
    const WorkUnit = mongoose.model<IWorkUnit>('WorkUnit');
    const parentUnit = await WorkUnit.findById(this.parentUnit);
    
    if (parentUnit) {
      // Child unit level is parent level + 1
      this.level = parentUnit.level + 1;
    }
  } else {
    // If no parent, set to level 1
    this.level = 1;
  }
  next();
});

const WorkUnit = mongoose.model<IWorkUnit>('WorkUnit', workUnitSchema);

export default WorkUnit; 