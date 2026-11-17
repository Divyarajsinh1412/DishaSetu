import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  faculty: {
    type: String,
    enum: [
      'School of Engineering',
      'School of Management',
      'School of Law',
      'School of Design',
      'School of Commerce',
      'School of Basic Sciences',
      'Administration',
      'Other'
    ],
    default: 'School of Engineering'
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    default: null
  },
  buildingShortCode: {
    type: String,
    trim: true
  },
  floorNumber: {
    type: Number,
    default: 1
  },
  headOfDepartment: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending_approval'],
    default: 'active'
  }
}, { timestamps: true });

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
