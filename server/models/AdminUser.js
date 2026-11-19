import mongoose from 'mongoose';

const AdminUserSchema = new mongoose.Schema({
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
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'campus_admin', 'building_manager', 'cafe_owner', 'editor', 'security_officer'],
    default: 'building_manager'
  },
  assignedBuildings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building'
  }],
  assignedCafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema, 'adminusers');
