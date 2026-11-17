import mongoose from 'mongoose';

const RestrictedAreaSchema = new mongoose.Schema({
  areaId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  geometry: {
    type: [[Number]], // [[lat, lng], ...]
    required: true
  },
  restrictionType: {
    type: String,
    enum: ['construction', 'staff_only', 'temporary_closure', 'event_restriction', 'hazardous'],
    default: 'temporary_closure'
  },
  active: {
    type: Boolean,
    default: true
  },
  reason: String,
  startTime: Date,
  endTime: Date
}, { timestamps: true });

export default mongoose.models.RestrictedArea || mongoose.model('RestrictedArea', RestrictedAreaSchema);
