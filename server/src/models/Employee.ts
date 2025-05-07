import mongoose, { Document } from 'mongoose';

export interface IEmployee extends Document {
  nip: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: Date;
  joinDate: Date;
  employeeType: 'pns' | 'p3k' | 'nonAsn';
  workUnit: string;
  subUnit?: string;
  position: string;
  rank?: string; // Golongan
  class?: string; // Pangkat
  educationLevel: 'sd' | 'smp' | 'sma' | 'd1' | 'd2' | 'd3' | 'd4' | 's1' | 's2' | 's3';
  educationMajor?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  photo?: string;
  retirementDate?: Date;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new mongoose.Schema<IEmployee>(
  {
    nip: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    joinDate: {
      type: Date,
      required: true,
    },
    employeeType: {
      type: String,
      enum: ['pns', 'p3k', 'nonAsn'],
      required: true,
    },
    workUnit: {
      type: String,
      required: true,
    },
    subUnit: {
      type: String,
    },
    position: {
      type: String,
      required: true,
    },
    rank: {
      type: String, // Golongan (e.g., "III/a", "IV/b")
    },
    class: {
      type: String, // Pangkat (e.g., "Penata Muda", "Pembina")
    },
    educationLevel: {
      type: String,
      enum: ['sd', 'smp', 'sma', 'd1', 'd2', 'd3', 'd4', 's1', 's2', 's3'],
      required: true,
    },
    educationMajor: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    photo: {
      type: String, // URL to photo
    },
    retirementDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate retirement date before saving if not provided
employeeSchema.pre('save', function(this: IEmployee, next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (!this.retirementDate && this.birthDate) {
    // In Indonesia, retirement age is generally 58 or 60 depending on position
    // Default to 58 years from birth date
    const retirementAge = 58;
    const birthDate = new Date(this.birthDate);
    this.retirementDate = new Date(
      birthDate.getFullYear() + retirementAge,
      birthDate.getMonth(),
      birthDate.getDate()
    );
  }
  next();
});

const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);

export default Employee; 