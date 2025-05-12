import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'superadmin' | 'admin' | 'user';

export interface IUser {
  username: string;
  password: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: number;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'user'],
      default: 'user',
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.method('comparePassword', async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
});

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User; 