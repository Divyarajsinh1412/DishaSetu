import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'staff', 'visitor', 'admin', 'super_admin'],
    default: 'student',
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    accessibleRoutesOnly: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    notificationsEnabled: { type: Boolean, default: true }
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, { timestamps: true });

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema, 'users');
