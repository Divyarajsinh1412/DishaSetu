import mongoose from 'mongoose';

const CampusManagerSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['head_facility_manager', 'estate_officer', 'security_incharge', 'floor_warden', 'cafeteria_supervisor'],
    default: 'estate_officer'
  },
  assignedZones: [{
    type: String,
    trim: true
  }],
  assignedBuildings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building'
  }],
  status: {
    type: String,
    enum: ['active', 'on_leave', 'inactive'],
    default: 'active'
  },
  officeLocation: {
    type: String,
    default: 'HR Block, Ground Floor'
  }
}, { timestamps: true });

CampusManagerSchema.index({ email: 1 }, { unique: true });
CampusManagerSchema.index({ status: 1 });

export default mongoose.models.CampusManager || mongoose.model('CampusManager', CampusManagerSchema, 'campusManagers');
